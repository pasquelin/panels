# Onglets de documents

🇬🇧 [This page in English](../en/DOCKVIEW.md) · [← Index](README.md)

Le centre est un emplacement libre : une route, un canvas, une carte. Si vous voulez des **onglets
de documents** — qu'on déplace, qu'on partage, qu'on empile — la bibliothèque fournit un
adaptateur au-dessus de [Dockview](https://dockview.dev).

C'est une **entrée séparée** : son poids ne pèse que sur les projets qui la veulent.

```bash
pnpm add dockview-react
```

```tsx
import { DockviewCenter } from '@pasquelin/panels/dockview'

function Editeur({ params }) {
  return <VueFichier nom={params.name as string} />
}

const DOCUMENTS = { editor: Editeur }

<Panels.Center>
  <DockviewCenter
    documents={DOCUMENTS}
    empty={RienDOuvert}
    layout={stockee}
    onLayout={setStockee}
    onReady={setApi}
  />
</Panels.Center>
```

| Propriété | |
| --- | --- |
| `documents` | Ce que chaque sorte rend, indexé par le nom de composant qu'un panneau demande |
| `empty` | Dessiné quand rien n'est ouvert. Sans lui, Dockview montre un filigrane nu |
| `layout` | Une disposition à restaurer, telle que `api.toJSON()` l'a donnée |
| `onLayout` | Appelée à chaque changement d'arrangement |
| `onReady` | L'api, pour ouvrir des documents depuis l'extérieur |

## Ouvrir un document

```tsx
const ouvrir = (nom: string) => {
  const tenu = api.getPanel(nom)
  if (tenu) return tenu.api.setActive()   // déjà ouvert : on le ramène devant

  api.addPanel({ id: nom, component: 'editor', title: nom, params: { name: nom } })
}
```

## Un panneau n'entre jamais au centre

La règle sur laquelle tout le châssis est bâti. **Un document a un nom ; un panneau a une icône.**

Les documents sont des choses qu'une personne ouvre et ferme, et ils portent un onglet qui dit
leur nom. Les panneaux se choisissent au rail et portent une icône. Les mélanger donne une fenêtre
où rien ne dit ce qui est un fichier et ce qui est un outil.

## Habillage

L'adaptateur habille Dockview des jetons du châssis : repeignez `--pnl-panel` et la barre
d'onglets suit. Sans lui, vous auriez le bleu marine par défaut de Dockview au milieu de votre
palette.

## Restaurer une disposition

Dockview lève une exception sur une disposition nommant un composant qu'il ne trouve pas. Celle
qui est refusée est **abandonnée**, et `onLayout(undefined)` est appelée pour que vous l'oubliiez
— gardée, elle échouerait de nouveau à chaque lancement.
