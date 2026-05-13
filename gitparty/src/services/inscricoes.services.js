const prisma = require("../data/prisma");

const limiteInscricoes = async (eventoId) => {
    const evento = await prisma.eventos.findUnique({
        where: { id : eventoId },
        include: {
            inscricoes: true
        }
    });

    const numeroInscricoes = evento.inscricoes.filter(inscricao => inscricao.status == "CONFIRMADA").length;

    if(numeroInscricoes == evento.capacidade_maxima) {
        return "LISTA_ESPERA";
    } else {
        return "";
    }
};

const inscricaoDuplicada = async (usuarioId, eventoId) => {
    const evento = await prisma.eventos.findUnique({
        where: { id : eventoId },
        include: {
            inscricoes: true
        }
    });

    const inscrito = evento.inscricoes.filter(inscricao => inscricao.usuariosId == usuarioId).length;

    if(inscrito == 1) {
        throw new Error("Usuario ja inscrito no evento");
    }
};

const validarPrazoCancelamento = async (inscricaoId) => {
    const inscricao = await prisma.inscricoes.findUnique({
        where: { id: inscricaoId },
        include: {
            evento: true
        }
    });

    const agora = new Date();
    const dataEvento = new Date(inscricao.evento.data);

    const diferencaHoras = (dataEvento - agora) / (1000 * 60 * 60);

    if (diferencaHoras < 24) {
        throw new Error("Prazo de cancelamento expirado");
    }
};

const promoverListaEspera = async (eventoId) => {
    const proximo = await prisma.inscricoes.findFirst({
        where: {
            eventoId: eventoId,
            status: "LISTA_ESPERA"
        },
        orderBy: {
            createdAt: "asc"
        }
    });

    if (proximo) {
        await prisma.inscricoes.update({
            where: { id: proximo.id },
            data: { status: "CONFIRMADA" }
        });
    }
};

const validarExclusaoEvento = async (eventoId) => {
    const evento = await prisma.eventos.findUnique({
        where: { id: eventoId },
        include: {
            inscricoes: true
        }
    });

    const agora = new Date();
    const dataEvento = new Date(evento.data);

    if (dataEvento < agora) {
        throw new Error("Evento já ocorreu e não pode ser excluído");
    }

    if (evento.inscricoes.length > 0) {
        throw new Error("Evento possui participantes e não pode ser excluído");
    }
};

const encerrarEvento = async (eventoId) => {
    const evento = await prisma.eventos.findUnique({
        where: { id: eventoId }
    });

    const agora = new Date();
    const dataEvento = new Date(evento.data);

    if (agora >= dataEvento) {
        await prisma.inscricoes.updateMany({
            where: {
                eventoId: eventoId,
                status: "LISTA_ESPERA"
            },
            data: {
                status: "CANCELADA"
            }
        });
    }
};

module.exports = {
    limiteInscricoes,
    inscricaoDuplicada,
    validarPrazoCancelamento,
    promoverListaEspera,
    validarExclusaoEvento,
    encerrarEvento
};