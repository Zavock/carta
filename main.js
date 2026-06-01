(function () {
  const fechaEl = document.getElementById("fecha");
  const btn = document.getElementById("btnFlores");
  const letter = document.getElementById("letter");
  const scene = document.querySelector(".scene");
  const canvasFlores = document.getElementById("flores");
  const canvasCorazones = document.getElementById("corazones");

  const opcionesFecha = { day: "numeric", month: "long", year: "numeric" };
  fechaEl.textContent = new Date().toLocaleDateString("es-ES", opcionesFecha);

  const garden = new FlowerGarden(canvasFlores);
  const hearts = new HeartRain(canvasCorazones);
  const letterBurn = new LetterBurn(letter);
  let revealed = false;

  btn.addEventListener("click", () => {
    if (revealed) return;

    revealed = true;
    btn.disabled = true;

    scene.classList.add("scene--blooming");
    garden.growBouquet();
    hearts.start();
    hearts.burst();

    setTimeout(() => {
      letterBurn.start(() => {
        scene.classList.remove("scene--blooming");
        scene.classList.add("scene--solo");
        garden.relayoutCenter();
      });
    }, 2800);
  });
})();
