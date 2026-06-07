# YourCar - Configurador de Veículos Full-Stack 🚗✨

Este projeto é uma aplicação Full-Stack desenvolvida para simular a experiência premium de configuração de veículos sob medida. O foco principal não foi apenas a interface, mas a construção de uma arquitetura robusta, conteinerizada e resiliente, aplicando princípios rigorosos de Engenharia de Software.

## 🚀 Tecnologias e Arquitetura

A stack foi escolhida para refletir o padrão moderno da indústria:

* **Front-end:** React (Vite) + Tailwind CSS para estilização fluida e Framer Motion para micro-interações dinâmicas.
* **Back-end:** Node.js com Express e TypeScript, modelado com princípios de Programação Orientada a Objetos (POO).
* **Banco de Dados:** MySQL (relacional) garantindo a integridade dos modelos e peças.
* **Infraestrutura:** Ambiente 100% conteinerizado com Docker e Docker Compose, isolando serviços e facilitando o deploy.
* **Inteligência Artificial:** Integração projetada com a API do Google Gemini.

## 🧠 O Diferencial: Resiliência e Fallback
Em sistemas de produção, dependências externas falham. O grande trunfo deste projeto é a sua arquitetura de resiliência. 

Foi implementado um mecanismo de comunicação híbrida no backend. Quando o usuário finaliza a montagem do carro, o sistema solicita à API do Google Gemini uma descrição persuasiva daquela configuração específica. Se a API externa apresentar instabilidade, limite de cota ou erro de rede (como falhas 404/500), o sistema não devolve uma tela branca ou um erro fatal. O backend intercepta a falha e aciona um **Mecanismo de Fallback** inteligente, processando os dados e retornando uma descrição gerada localmente. O sistema não quebra, ele se adapta.
