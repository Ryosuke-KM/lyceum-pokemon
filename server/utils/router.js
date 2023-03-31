import { Router } from "express";
import {
  findTrainers,
  upsertTrainer,
  getTrainer,
  deleteTrainer,
} from "~/server/utils/trainer";
import { findPokemon } from "~/server/utils/pokemon";

const router = Router();

router.get("/hello", (_req, res) => {
  res.send("Hello World");
});

/** トレーナー名の一覧の取得 */
router.get("/trainers", async (_req, res, next) => {
  try {
    const trainers = await findTrainers();
    let trainerNames = [];
    for (let trainer of trainers) {
      // trainerNames.push(trainer.Key.replace(/\.[^.$]+$/, ''))
      trainerNames.push(trainer.Key.replace(/\.json$/, ""));
    }
    res.send(trainerNames);
  } catch (err) {
    next(err);
  }
});

/** トレーナーの追加 */
router.post("/trainer", async (req, res, next) => {
  try {
    if (!req.body.name) {
      return res.sendStatus(400);
    }
    const trainers = await findTrainers();
    let trainerNames = [];
    for (let trainer of trainers) {
      trainerNames.push(trainer.Key.replace(/\.json$/, ""));
    }
    if (trainerNames.includes(req.body.name)) {
      return res.sendStatus(409);
    }
    const result = await upsertTrainer(req.body.name, req.body);
    res.status(result["$metadata"].httpStatusCode).send(result);
  } catch (err) {
    next(err);
  }
});

/** トレーナーの取得 */
router.get("/trainer/:trainerName", async (req, res, next) => {
  try {
    const { trainerName } = req.params;
    const result = await getTrainer(trainerName);
    const trainer = await JSON.parse(await result.Body.transformToString());
    res.status(result["$metadata"].httpStatusCode).send(trainer);
  } catch (err) {
    next(err);
  }
});

/** トレーナーの更新 */
router.post("/trainer/:trainerName", async (req, res, next) => {
  try {
    const { trainerName } = req.params;
    const trainers = await findTrainers();
    let trainerNames = [];
    for (let trainer of trainers) {
      trainerNames.push(trainer.Key.replace(/\.json$/, ""));
    }
    if (!trainerNames.includes(req.body.name)) {
      return res.sendStatus(404);
    }
    const result = await upsertTrainer(trainerName, req.body);
    res.status(result["$metadata"].httpStatusCode).send(result);
  } catch (err) {
    next(err);
  }
});

/** トレーナーの削除 */
router.delete("/trainer/:trainerName", async (req, res, next) => {
  try {
    const { trainerName } = req.params;
    const result = await deleteTrainer(trainerName);
    res.status(result["$metadata"].httpStatusCode).send(result);
  } catch (err) {
    next(err);
  }
});

/** ポケモンの追加 */
router.put(
  "/trainer/:trainerName/pokemon/:pokemonName",
  async (req, res, next) => {
    try {
      const { trainerName, pokemonName } = req.params;
      const rawTrainer = await getTrainer(trainerName);
      const trainer = await JSON.parse(
        await rawTrainer.Body.transformToString()
      );
      const pokemon = await findPokemon(pokemonName);
      const {
        order,
        name,
        sprites: { front_shiny },
      } = pokemon;
      trainer.pokemons.push({
        id: Date.now(),
        nickname: "",
        order,
        name,
        sprites: { front_shiny },
      });
      const result = await upsertTrainer(trainerName, trainer);
      res.status(result["$metadata"].httpStatusCode).send(result);
    } catch (err) {
      next(err);
    }
  }
);

/** ポケモンの削除 */
router.delete(
  "/trainer/:trainerName/pokemon/:pokemonId",
  async (req, res, next) => {
    try {
      const { trainerName, pokemonId } = req.params;
      const rawTrainer = await getTrainer(trainerName);
      const trainer = await JSON.parse(
        await rawTrainer.Body.transformToString()
      );
      // !==だとID不一致を検出できない
      trainer.pokemons = trainer.pokemons.filter((pokemon) => {
        return pokemon.id != pokemonId;
      });
      const result = await upsertTrainer(trainerName, trainer);
      res.status(result["$metadata"].httpStatusCode).send(result);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
