const prisma = require("../data/prisma");
const fs = require("fs");

const cadastrar = async (req, res) => {
  try {
    const idEvento = parseInt(req.params.id);
    const arquivo = req.file;

    if (!arquivo) {
      return res.status(400).json({ erro: "Arquivo não enviado" });
    }

    const pastaFinal = `uploads/eventos/${idEvento}`;
    const caminhoFinal = `${pastaFinal}/${arquivo.filename}`;

    if (!fs.existsSync(pastaFinal)) {
      fs.mkdirSync(pastaFinal, { recursive: true });
    }

    fs.renameSync(arquivo.path, caminhoFinal);

    const imagem = await prisma.imagem.create({
      data: {
        nomeOriginal: arquivo.originalname,
        nomeArquivo: arquivo.filename,
        mimeType: arquivo.mimetype,
        path: caminhoFinal,
        publicacoesId: idEvento,
      },
    });

    res.status(201).json(imagem);
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ error: error.message });
  }
};

const listar = async (req, res) => {
  try {
    const lista = await prisma.imagem.findMany();
    res.status(200).json(lista);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const buscar = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const imagem = await prisma.imagem.findUnique({
      where: { id },
    });

    if (!imagem) {
      return res.status(404).json({ erro: "Imagem não encontrada" });
    }

    if (!fs.existsSync(imagem.path)) {
      return res
        .status(404)
        .json({ erro: "Arquivo não encontrado no servidor" });
    }

    res.sendFile(imagem.path, { root: "." });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar imagem" });
  }
};

const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const dados = req.body;

    const item = await prisma.imagem.update({
      where: { id: Number(id) },
      data: dados,
    });

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const excluir = async (req, res) => {
  try {
    const { id } = req.params;

    const imagem = await prisma.imagem.delete({
      where: { id: Number(id) },
    });

    if (fs.existsSync(imagem.path)) {
      fs.unlinkSync(imagem.path);
    }

    res.status(200).json(imagem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  cadastrar,
  listar,
  buscar,
  atualizar,
  excluir,
};