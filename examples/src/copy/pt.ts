import type { Copy } from './shape'

export const pt: Copy = {
  nav: { overview: 'Visão geral', examples: 'Exemplos', api: 'API' },
  hero: {
    eyebrow: 'React 19 · 8 kB comprimido · sem dependências',
    title: ['O chassi', 'sob', 'a sua ferramenta.'],
    lead: 'Trilhos de ícones nas bordas, zonas redimensionáveis em volta de um centro que é seu, e um layout que sobrevive a um recarregamento. Sem renderização por baixo, repintável por cima.',
    copy: 'Copiar',
    copied: 'Copiado',
    seeExamples: 'Ver os exemplos',
    caption:
      'Ao vivo. Arraste as divisões entre as superfícies, clique num ícone do trilho, redimensione a janela.',
  },
  demo: {
    centre: 'O seu centro',
    centreHint: 'uma rota · um canvas · um mapa · abas de documentos',
    panels: {
      files: 'Arquivos',
      search: 'Buscar',
      outline: 'Estrutura',
      notes: 'Notas',
      console: 'Console',
    },
    said: {
      share: 'Dois painéis dividem esta metade. O trilho alterna entre eles.',
      second: 'A segunda metade da mesma coluna, com a sua própria alça.',
      opens: 'Este pede para abrir mais largo do que a sua coluna.',
      band: 'A faixa corre sob a coluna que estiver aberta.',
    },
  },
  examples: {
    title: 'Quatro formas de começar',
    lead: 'Cada um roda no seu navegador e o código completo está à vista. Comece pelo mais próximo.',
    tip: 'Dica.',
    open: name => `Abrir ${name}`,
  },
  api: {
    title: 'Toda a superfície',
    lead: 'Não é muita, e é esse o ponto. Cinco coisas para saber.',
  },
  foot: {
    docs: 'Documentação',
    architecture: 'Arquitetura',
    source: 'Código',
    note: 'MIT · por alban.pasquelin · o chassi desta página é a própria biblioteca',
  },
  langLabel: 'Idioma',
  cards: [
    {
      title: 'Mínimo',
      what: 'O menor chassi que funciona. Duas colunas, uma faixa, um centro — e um cabeçalho seu comandando tudo.',
      tip: 'Painéis que dividem a mesma zona e a mesma metade se revezam; o trilho alterna entre eles. Dê a metade secundária a um deles para empilhá-lo sob o primeiro.',
    },
    {
      title: 'React Router',
      what: 'O centro é uma saída de rota. Navegar muda o meio e nada mais: as colunas mantêm a largura e os painéis abertos continuam abertos.',
      tip: 'Declare os painéis na rota de layout, acima da saída. Declarados por página, seriam desmontados a cada navegação e perderiam o que guardavam.',
    },
    {
      title: 'Abas de documentos',
      what: 'O centro carrega documentos no Dockview — abas que se arrastam e se dividem — enquanto os painéis ficam nas bordas.',
      tip: 'Importe do ponto de entrada dockview: assim o peso recai só sobre os projetos que querem abas. Um painel nunca entra no centro: um documento tem nome, um painel tem ícone.',
    },
    {
      title: 'Repintado',
      what: 'O mesmo chassi sob quatro paletas. Cores, raio, largura do trilho, altura do cabeçalho — tudo são propriedades personalizadas.',
      tip: 'Defina o token de destaque em qualquer ancestral e o chassi herdará a sua marca em vez de impor a dele. Precisa ir além? Cada peça é exportada e substituível sozinha.',
    },
  ],
  api5: [
    {
      name: 'Declarar',
      body: 'Um painel é um descritor: onde ele fica, como se chama e o que desenha.',
    },
    {
      name: 'Comandar',
      body: 'Um único hook para qualquer cabeçalho, atalho ou menu que precise agir sobre os painéis.',
    },
    {
      name: 'Comandar fora do React',
      body: 'Crie você mesmo o store e um socket, um menu nativo ou um worker poderá abrir um painel.',
    },
    {
      name: 'Repintar',
      body: 'Cada valor é uma propriedade personalizada. Defina o destaque e os trilhos seguem a sua marca.',
    },
    {
      name: 'Ou ficar só com a lógica',
      body: 'Os componentes são construídos sobre hooks que não desenham nada. Desenhe o seu próprio quadro sobre eles.',
    },
  ],
}
