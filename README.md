
# 🚛 CBD Logística & BI - Gestão de Frotas

Sistema avançado de Business Intelligence (BI) para gestão diária de frotas e controle de entregas. O aplicativo permite a importação de dados via planilhas Excel ou fotos de romaneios, utilizando a **IA Gemini da Google** para processamento inteligente.

![Status Online](https://img.shields.io/badge/Status-Online-emerald)
![Versão](https://img.shields.io/badge/Versão-1.0.0-blue)

## 🌟 Funcionalidades Principais

- **Dashboard de BI**: Visualização em tempo real de Entregas OK, Voltas, Faturamento e Perdas.
- **Análise de Tendência**: Gráficos comparativos dos últimos 6 meses para análise de performance.
- **Leitor de IA**: Importe fotos de planilhas manuais e deixe a IA extrair os dados automaticamente.
- **Gestão por Motorista**: Histórico detalhado de rotas e cargas por colaborador (Casa e Agregados).
- **Offline First**: Indicador de conexão e armazenamento local persistente (`localStorage`).
- **Lançamento em Lote**: Interface rápida para alimentar múltiplos motoristas simultaneamente.

## 🚀 Como Rodar o Projeto

Este projeto utiliza **ES Modules** nativos, o que significa que não é necessário um processo de compilação (build) complexo.

1. **Clonar o repositório**:
   ```bash
   git clone https://github.com/seu-usuario/nome-do-repo.git
   cd nome-do-repo
   ```

2. **Abrir no Servidor Local**:
   Você pode usar qualquer servidor estático. Exemplo com `serve`:
   ```bash
   npx serve .
   ```

3. **Configuração da API Key**:
   O sistema espera uma chave da API do Google Gemini configurada no ambiente como `API_KEY`. Para uso local, certifique-se de que a variável esteja acessível.

## 📊 Estrutura de BI e Dados

O aplicativo foi desenhado para ser um **Power BI de bolso**:
- **Faturamento Líquido**: Calcula automaticamente `Valor Bruto - Valor de Ocorrências`.
- **Deltas de Performance**: Indica crescimento ou queda percentual em relação ao mês anterior.
- **Persistent Storage**: Todos os dados são salvos no navegador do usuário, permitindo consultas retroativas de meses e anos anteriores.

## 🛠️ Tecnologias Utilizadas

- **React 19** (via ESM.sh)
- **Tailwind CSS** (Estilização)
- **Lucide React** (Ícones)
- **Recharts** (Gráficos Analíticos)
- **Google Generative AI** (Processamento de Imagem/OCR)

## 📄 Licença

Este projeto está sob a licença MIT.
