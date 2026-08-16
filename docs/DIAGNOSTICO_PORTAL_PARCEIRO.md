# Diagnóstico de acesso ao portal do parceiro

Em 16 de agosto de 2026, a rota local `/partners/` respondeu ao servidor e entregou o documento HTML do portal, mas o contêiner raiz permaneceu vazio. O console identificou que o React Router não reconhecia o caminho `/partners/`.

Após configurar o caminho base do roteador como `/partners` e reconstruir o painel, a mesma rota encaminhou corretamente para `/partners/login` e apresentou o formulário de acesso do parceiro. O próximo passo é autenticar uma conta de parceiro aprovada e reunir os dados confirmados das sacolas antes de qualquer publicação.
