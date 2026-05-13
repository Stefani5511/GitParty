const API_URL = "http://localhost:3000/eventos";

const openModal = document.getElementById("openModal");
const closeModal = document.getElementById("closeModal");
const modalOverlay = document.getElementById("modalOverlay");
const eventForm = document.getElementById("eventForm");
const eventsList = document.getElementById("eventsList");

const homeScreen = document.getElementById("homeScreen");
const detailsScreen = document.getElementById("detailsScreen");

const detailTitle = document.getElementById("detailTitle");
const detailDate = document.getElementById("detailDate");
const detailDescription = document.getElementById("detailDescription");
const detailLocal = document.getElementById("detailLocal");
const detailCapacity = document.getElementById("detailCapacity");

const backHome = document.getElementById("backHome");

const imageInput = document.getElementById("imageInput");
const previewImage = document.getElementById("previewImage");
const uploadButton = document.getElementById("uploadButton");

let currentEventId = null;

openModal.addEventListener("click", () => {
  modalOverlay.classList.remove("hidden");
});

closeModal.addEventListener("click", () => {
  modalOverlay.classList.add("hidden");
});

backHome.addEventListener("click", () => {
  detailsScreen.classList.add("hidden");
  homeScreen.classList.remove("hidden");
});

eventForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const evento = {
    titulo: document.getElementById("titulo").value,
    descricao: document.getElementById("descricao").value,
    data_evento: document.getElementById("data_evento").value,
    local: document.getElementById("local").value,
    capacidade_maxima: Number(
      document.getElementById("capacidade_maxima").value
    )
  };

  try {
    await fetch(`${API_URL}/cadastrar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(evento)
    });

    modalOverlay.classList.add("hidden");

    eventForm.reset();

    loadEvents();
  } catch (error) {
    console.log(error);

    alert("Erro ao cadastrar evento");
  }
});

async function loadEvents() {
  try {
    const response = await fetch(`${API_URL}/listar`);

    const eventos = await response.json();

    eventsList.innerHTML = "";

    eventos.forEach((evento) => {
      const card = document.createElement("div");

      card.classList.add("event-card");

      card.innerHTML = `
        <h3>${evento.titulo}</h3>
        <p>${evento.descricao}</p>
        <p><strong>Data:</strong> ${evento.data_evento}</p>
        <p><strong>Local:</strong> ${evento.local}</p>

        <button class="details-button">
          Ver detalhes
        </button>
      `;

      const detailsButton =
        card.querySelector(".details-button");

      detailsButton.addEventListener("click", () => {
        openDetails(evento);
      });

      eventsList.appendChild(card);
    });
  } catch (error) {
    console.log(error);

    eventsList.innerHTML = `
      <p>Erro ao carregar eventos</p>
    `;
  }
}

function openDetails(evento) {
  currentEventId = evento.id;

  homeScreen.classList.add("hidden");

  detailsScreen.classList.remove("hidden");

  detailTitle.textContent = evento.titulo;

  detailDate.textContent = evento.data_evento;

  detailDescription.textContent =
    evento.descricao;

  detailLocal.textContent = evento.local;

  detailCapacity.textContent =
    evento.capacidade_maxima;

  if (evento.imagem) {
    previewImage.src = evento.imagem;

    previewImage.style.display = "block";
  } else {
    previewImage.style.display = "none";
  }
}

uploadButton.addEventListener("click", async () => {
  const file = imageInput.files[0];

  if (!file) {
    alert("Selecione uma imagem");

    return;
  }

  const formData = new FormData();

  formData.append("imagem", file);

  try {
    const response = await fetch(
      `http://localhost:3000/imagem/upload/${currentEventId}`,
      {
        method: "POST",
        body: formData
      }
    );

    const data = await response.json();

    if (data.imagem) {
      previewImage.src = data.imagem;

      previewImage.style.display = "block";
    }

    alert("Imagem enviada");
  } catch (error) {
    console.log(error);

    alert("Erro ao enviar imagem");
  }
});

loadEvents();