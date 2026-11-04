(() => {
  const select = document.querySelector("#wiki-chapter-select");
  if (!select) return;

  const frame = document.querySelector("#wiki-chapter-frame");
  const original = document.querySelector("#wiki-chapter-source");
  const options = new Map(
    Array.from(select.options, (option) => [option.value, option.dataset.source]),
  );

  function showChapter(chapter) {
    const source = options.get(chapter);
    if (frame.getAttribute("src") !== source) frame.src = source;
    frame.title = `Critter Formations, capítulo ${chapter}`;
    original.href = source;
    original.textContent = `Abrir capítulo ${chapter} no site original`;
    select.value = chapter;
  }

  const requested = new URL(location.href).searchParams.get("capitulo");
  showChapter(options.has(requested) ? requested : select.value);
  select.disabled = false;

  select.addEventListener("change", () => {
    showChapter(select.value);

    // Permite compartilhar o capítulo pelo endereço da wiki.
    const url = new URL(location.href);
    url.searchParams.set("capitulo", select.value);
    history.replaceState(history.state, "", url);
  });
})();
