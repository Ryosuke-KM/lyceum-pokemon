<script setup>
const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();
const { data: trainer, refresh } = await useFetch(
  `${config.backendOrigin}/api/trainer/${route.params.name}`
);
const nickName = ref("");
const {
  dialog: trainerDialog,
  onOpen: onTrainerOpen,
  onClose: onTrainerClose,
} = useDialog();

const {
  dialog: pokemonDialog,
  onOpen: onPokemonOpen,
  onClose: onPokemonClose,
} = useDialog();

const {
  dialog: nicknameDialog,
  onOpen: onNicknameOpen,
  onClose: onNicknameClose,
} = useDialog();

const deleteTrainer = async () => {
  const { error } = await useFetch(
    `${config.backendOrigin}/api/trainer/${route.params.name}`,
    {
      method: "DELETE",
    }
  );
  if (!error.value) {
    router.push("/");
  } else {
    console.log(error);
  }
};

const deletePokemon = async (pokemonId) => {
  const { error } = await useFetch(
    `${config.backendOrigin}/api/trainer/${route.params.name}/pokemon/${pokemonId}`,
    {
      method: "DELETE",
    }
  );
  if (!error.value) {
    await refresh();
    onPokemonClose();
  } else {
    console.log(error);
  }
};

const addNickname = async (pokemon) => {
  pokemon.nickname = nickName;
  const { error } = await useFetch(
    `${config.backendOrigin}/api/trainer/${route.params.name}`,
    {
      method: "POST",
      body: trainer,
    }
  );
  if (!error.value) {
    await refresh();
    onNicknameClose();
  } else {
    console.log(error);
  }
};
</script>

<template>
  <div>
    <h1>トレーナー情報</h1>
    <span><img src="/avatar.png" /> {{ trainer.name }}</span>
    <p>
      <gamify-button @click="onTrainerOpen(true)"
        >マサラタウンにかえる</gamify-button
      >
    </p>
    <h2>てもちポケモン</h2>
    <p>
      <catch-button :to="`/trainer/${trainer.name}/catch`"
        >ポケモンをつかまえる</catch-button
      >
    </p>
    <gamify-list>
      <gamify-item v-for="pokemon in trainer.pokemons" :key="pokemon.id">
        <span>{{ pokemon.order }}</span>
        <img :src="pokemon.sprites.front_shiny||pokemon.sprites.front_default" />
        <span>{{ pokemon.nickname || pokemon.name }}</span>
        <gamify-button @click="onNicknameOpen(pokemon)"
          >ニックネームをつける</gamify-button
        >
        <gamify-button @click="onPokemonOpen(pokemon)"
          >はかせにおくる</gamify-button
        >
      </gamify-item>
      <!-- ここに捕まえたポケモンリスト -->
    </gamify-list>
    <gamify-dialog
      v-if="trainerDialog"
      id="deleteTrainer"
      title="かくにん"
      description="ほんとうに  マサラタウンに  かえるんだな！  この  そうさは  とりけせないぞ！"
    >
      <gamify-list :border="false" direction="horizon">
        <gamify-item>
          <gamify-button @click="onTrainerClose">いいえ</gamify-button>
        </gamify-item>
        <gamify-item>
          <gamify-button @click="deleteTrainer">はい</gamify-button>
        </gamify-item>
      </gamify-list>
    </gamify-dialog>
    <gamify-dialog
      v-if="pokemonDialog"
      id="deletePokemon"
      title="かくにん"
      :description="`ほんとうに  ${pokemonDialog.name}  を  はかせに  おくるんだな！  この  そうさは  とりけせないぞ！`"
      @close="onPokemonClose"
    >
      <gamify-list :border="false" direction="horizon">
        <gamify-item>
          <gamify-button @click="onPokemonClose">いいえ</gamify-button>
        </gamify-item>
        <gamify-item>
          <gamify-button @click="deletePokemon(pokemonDialog.id)"
            >はい</gamify-button
          >
        </gamify-item>
      </gamify-list>
    </gamify-dialog>
    <gamify-dialog
      v-if="nicknameDialog"
      id="addNickname"
      title="ニックネーム"
      :description="`${nicknameDialog.name}  の  ニックネームは？`"
      @close="
        onNicknameClose();
        nickName = '';
      "
    >
      <span>ニックネーム</span><br />
      <input v-model="nickName" type="text" />
      <gamify-list :border="false" direction="horizon">
        <gamify-item>
          <gamify-button
            @click="
              onNicknameClose();
              nickName = '';
            "
            >キャンセル</gamify-button
          >
        </gamify-item>
        <gamify-item>
          <gamify-button @click="addNickname(nicknameDialog)"
            >けってい</gamify-button
          >
        </gamify-item>
      </gamify-list>
    </gamify-dialog>
    <p>
      <gamify-button
        @click="
          () => {
            $router.push('/trainer');
          }
        "
        >もどる</gamify-button
      >
    </p>
  </div>
</template>
