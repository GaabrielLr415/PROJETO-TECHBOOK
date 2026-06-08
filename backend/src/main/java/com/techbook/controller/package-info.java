/**
 * Camada de entrada da API REST.
 *
 * Os controllers recebem as requisicoes HTTP do frontend, validam o token
 * administrativo quando necessario e delegam as regras para o TechbookService.
 * Evite colocar regra de negocio aqui; deixe este pacote como ponte entre tela
 * e servico.
 */
package com.techbook.controller;

