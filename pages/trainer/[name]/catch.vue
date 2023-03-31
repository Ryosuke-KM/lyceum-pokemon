<script setup>
const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();
const pokemons = ref();
const pageNum = ref(1);
// 最初はAPIに直接接続しに行く（初期ページの20体の情報が返ってくるのでそれを格納）
const response = await useFetch("https://pokeapi.co/api/v2/pokemon");
pokemons.value = await response.data.value;
// ポケモンの全数を1ページ当たりの表示限界20体で割った値
// クエリでlimitを変えられるが、previous/nextのURLを活用するので規定値の20としたハードコーディング
const maxPageNum = Math.round(pokemons.value.count / 20) + 1;
const { dialog, onOpen, onClose } = useDialog();
const catchPokemon = async (pokemon) => {
  const { error } = await useFetch(
    `${config.backendOrigin}/api/trainer/${route.params.name}/pokemon/${pokemon.name}`,
    {
      method: "PUT",
    }
  );
  if (!error.value) {
    router.push(`/trainer/${route.params.name}`);
  } else {
    console.log(error);
  }
};

const toPrev = async () => {
  const prevPage = await useFetch(pokemons.value.previous);
  pokemons.value = await prevPage.data.value;
  pageNum.value--;
};

const toNext = async () => {
  const nextPage = await useFetch(pokemons.value.next);
  pokemons.value = await nextPage.data.value;
  pageNum.value++;
};
</script>

<template>
  <div>
    <h1>ポケモンをつかまえる</h1>
    <span>{{ pokemons.count }}しゅるいのポケモン</span>
    <p>{{ pageNum }} / {{ maxPageNum }}ページ</p>
    <gamify-list>
      <gamify-item v-for="pokemon in pokemons.results" :key="pokemon.url">
        <span>{{ pokemon.name }}</span>
        <gamify-button @click="onOpen(pokemon)">つかまえる</gamify-button>
      </gamify-item>
    </gamify-list>
    <gamify-dialog
      v-if="dialog"
      id="catch"
      title="かくにん"
      :description="`ほう！  ${dialog.name}  にするんじゃな？`"
      @close="onClose"
    >
      <gamify-list :border="false" direction="horizon">
        <gamify-item>
          <gamify-button @click="onClose">いいえ</gamify-button>
        </gamify-item>
        <gamify-item>
          <gamify-button @click="catchPokemon(dialog)">はい</gamify-button>
        </gamify-item>
      </gamify-list>
    </gamify-dialog>
    <gamify-list :border="false" direction="horizon">
      <gamify-item>
        <gamify-button :disabled="!pokemons.previous" @click="toPrev"
          >まえへ</gamify-button
        >
      </gamify-item>
      <gamify-item>
        <gamify-button :disabled="!pokemons.next" @click="toNext"
          >つぎへ</gamify-button
        >
      </gamify-item>
      <gamify-item>
        <gamify-button
          @click="
            () => {
              $router.push(`/trainer/${$route.params.name}`);
            }
          "
          >つかまえるのをやめる</gamify-button
        >
      </gamify-item>
    </gamify-list>
  </div>
</template>
