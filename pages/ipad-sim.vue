<script lang="ts" setup>
const sheetId = "626b65ce9af3cb00115df7ba";
const sourceUrl = "https://api.fluro.io/get/626b65ce9af3cb00115df7ba";
</script>

<template>
  <main>
    <swiper-container :keyboard="true" :pagination="true">
      <swiper-slide>
        <PdfRender
          :source="sourceUrl"
          :page="1"
          song="ipad-sim"
          :sheet-id="sheetId"
        />
      </swiper-slide>
    </swiper-container>
  </main>
</template>
