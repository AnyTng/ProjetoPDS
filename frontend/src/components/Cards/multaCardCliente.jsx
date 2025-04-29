// src/components/Cards/multaCardCliente.jsx

import React from "react";
import Button from "../button.jsx";
import { fetchWithAuth } from "../../utils/api";

const MultaCardCliente = ({ multa }) => {
    const {
        idinfracao,
        dataInfracao,
        valorInfracao,
        descInfracao,
        estadoInfracao,
        dataLimPagInfracoes,
        aluguerIdaluguerNavigation
    } = multa;

    // Detalhes do veículo
    const veicNav = aluguerIdaluguerNavigation.veiculoIdveiculoNavigation;
    const marca = veicNav.modeloVeiculoIdmodeloNavigation.marcaVeiculoIdmarcaNavigation.descMarca;
    const modelo = veicNav.modeloVeiculoIdmodeloNavigation.descModelo;
    const matricula = veicNav.matriculaVeiculo;

    const formatDate = dateStr =>
        dateStr ? new Date(dateStr).toLocaleDateString("pt-PT") : "N/A";

    // Cores conforme estado
    const getStateColor = st => {
        switch ((st || "").toLowerCase()) {
            case "submetida":
            case "aguarda pagamento":
                return "bg-yellow-50 border-yellow-200";
            case "paga":
                return "bg-green-50 border-green-200";
            case "expirada":
                return "bg-gray-50 border-gray-200";
            case "contestada":
                return "bg-blue-50 border-blue-200";
            case "contestação aceite":
                return "bg-green-100 border-green-300";
            case "contestação rejeitada":
                return "bg-red-50 border-red-200";
            case "cancelada":
                return "bg-red-100 border-red-300";
            default:
                return "bg-gray-50 border-gray-200";
        }
    };

    // Ícone conforme estado
    const getStateIcon = st => {
        const s = (st || "").toLowerCase();
        if (s.includes("submetida") || s.includes("aguarda")) return PendingIcon;
        if (s.includes("paga")) return PaidIcon;
        if (s.includes("expirada")) return ExpiredIcon;
        if (s.includes("contestação aceite")) return AcceptedIcon;
        if (s.includes("contestação rejeitada")) return RejectedIcon;
        if (s.includes("contestada")) return ContestedIcon;
        if (s.includes("cancelada")) return CanceledIcon;
        return DefaultIcon;
    };

    // Componentes SVG
    function PendingIcon() {
        return (
            <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        );
    }
    function PaidIcon() {
        return (
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        );
    }
    function ExpiredIcon() {
        return (
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        );
    }
    function ContestedIcon() {
        return (
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        );
    }
    function AcceptedIcon() {
        return (
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M5 13l4 4L19 7" />
            </svg>
        );
    }
    function RejectedIcon() {
        return (
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        );
    }
    function CanceledIcon() {
        return (
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12" />
            </svg>
        );
    }
    function DefaultIcon() {
        return (
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        );
    }

    // Se o estado permitir pagamento, chama a Stripe
    const canPay = ["submetida", "aguarda pagamento"].includes(estadoInfracao.toLowerCase());
    const handlePay = async () => {
        try {
            const res = await fetchWithAuth(
                `/api/Infracoes/PagarMulta?idInfracao=${idinfracao}`,
                { method: "POST" }
            );
            // o wrapper fetchWithAuth faz return do JSON
            const { checkoutUrl } = res;
            window.location.href = checkoutUrl;
        } catch (err) {
            console.error("Erro ao iniciar pagamento:", err);
            alert("Não foi possível iniciar o pagamento.");
        }
    };

    const StateIcon = getStateIcon(estadoInfracao);

    return (
        <div className={`w-full border rounded-2xl px-6 py-5 flex flex-col gap-4 shadow-sm ${getStateColor(estadoInfracao)}`}>
            {/* Header com ícone + estado + ID */}
            <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                    <StateIcon />
                    <span className="font-semibold text-lg">{estadoInfracao}</span>
                </div>
                <div className="text-sm font-medium text-gray-500">ID: {idinfracao}</div>
            </div>

            {/* Detalhes da multa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3 text-sm">
                <InfoRow label="Veículo:" value={`${marca} ${modelo} (${matricula})`} />
                <InfoRow label="Data Infração:" value={formatDate(dataInfracao)} />
                <InfoRow label="Prazo Pagamento:" value={formatDate(dataLimPagInfracoes)} />
                <InfoRow label="Valor (€):" value={valorInfracao.toFixed(2)} />
                <InfoRow label="Descrição:" value={descInfracao} colSpanFull />
            </div>

            {/* Botão de pagamento */}
            <div className="flex justify-end mt-2 gap-3">
                {canPay && (
                    <Button
                        text="Pagar Agora"
                        variant="primary"
                        onClick={handlePay}
                        className="px-6 !py-1 text-base"
                    />
                )}
            </div>
        </div>
    );
};

const InfoRow = ({ label, value, colSpanFull }) => (
    <div className={`flex items-center gap-2 ${colSpanFull ? "sm:col-span-2" : ""}`}>
        <span className="font-semibold text-slate-900">{label}</span>
        <span className="text-slate-700">{value}</span>
    </div>
);

export default MultaCardCliente;