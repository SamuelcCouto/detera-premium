"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { whatsappUrl } from "@/lib/utils/whatsapp";
import {
  contatoSchema,
  mensagemDeContato,
  tiposDeProjeto,
} from "@/features/contato/schema";

type Erros = Partial<Record<"nome" | "email" | "tipo" | "mensagem", string>>;

export function FormularioContato() {
  const [erros, setErros] = useState<Erros>({});
  const [aviso, setAviso] = useState("");

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const dados = Object.fromEntries(new FormData(evento.currentTarget));
    const resultado = contatoSchema.safeParse(dados);

    if (!resultado.success) {
      const encontrados: Erros = {};
      for (const problema of resultado.error.issues) {
        const campo = problema.path[0] as keyof Erros;
        encontrados[campo] ??= problema.message;
      }
      setErros(encontrados);
      setAviso("Faltou preencher alguma coisa — veja os campos marcados.");
      return;
    }

    setErros({});
    setAviso("Abrindo o WhatsApp com a sua mensagem pronta. É só apertar enviar.");

    /**
     * Aberto de forma síncrona dentro do handler: qualquer `await` antes disto
     * faz o navegador tratar a janela como pop-up e bloquear.
     */
    window.open(
      whatsappUrl(mensagemDeContato(resultado.data)),
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo rotulo="Nome" nome="nome" erro={erros.nome} autoComplete="name" />
        <Campo rotulo="Empresa (opcional)" nome="empresa" autoComplete="organization" />
      </div>

      <Campo
        rotulo="E-mail"
        nome="email"
        tipo="email"
        erro={erros.email}
        autoComplete="email"
      />

      <div className="flex flex-col gap-2">
        <label htmlFor="campo-tipo" className="text-texto-suave text-[0.9rem]">
          Sobre o que você quer falar
        </label>
        <select
          id="campo-tipo"
          name="tipo"
          defaultValue={tiposDeProjeto[0]}
          className="campo"
        >
          {tiposDeProjeto.map((tipo) => (
            <option key={tipo} value={tipo} className="bg-camada text-texto">
              {tipo}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="campo-mensagem" className="text-texto-suave text-[0.9rem]">
          O que você quer construir
        </label>
        <textarea
          id="campo-mensagem"
          name="mensagem"
          rows={4}
          placeholder="Conte o que o seu negócio faz e o que precisa acontecer."
          aria-invalid={Boolean(erros.mensagem)}
          aria-describedby={erros.mensagem ? "erro-mensagem" : undefined}
          className="campo min-h-[7rem] resize-y"
        />
        {erros.mensagem ? (
          <p id="erro-mensagem" className="text-determinacao-viva text-[0.85rem]">
            {erros.mensagem}
          </p>
        ) : null}
      </div>

      <Button type="submit" variant="determinacao" className="self-start">
        Começar uma conversa
      </Button>

      <p
        role="status"
        aria-live="polite"
        className="text-texto-suave min-h-[1.4em] text-[0.85rem]"
      >
        {aviso}
      </p>
    </form>
  );
}

function Campo({
  rotulo,
  nome,
  tipo = "text",
  erro,
  autoComplete,
}: {
  rotulo: string;
  nome: string;
  tipo?: string;
  erro?: string;
  autoComplete?: string;
}) {
  const id = `campo-${nome}`;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-texto-suave text-[0.9rem]">
        {rotulo}
      </label>
      <input
        id={id}
        name={nome}
        type={tipo}
        autoComplete={autoComplete}
        aria-invalid={Boolean(erro)}
        aria-describedby={erro ? `erro-${nome}` : undefined}
        className="campo"
      />
      {erro ? (
        <p id={`erro-${nome}`} className="text-determinacao-viva text-[0.85rem]">
          {erro}
        </p>
      ) : null}
    </div>
  );
}
