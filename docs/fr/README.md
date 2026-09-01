# @pasquelin/panels — documentation

Un châssis à panneaux pour React : des rails d'icônes sur les bords, des zones redimensionnables
autour d'un centre qui est le vôtre, et une disposition qui survit au rechargement.

🇬🇧 [This page in English](../en/README.md)

| | |
| --- | --- |
| [Panneaux](PANELS.md) | Déclarer un panneau : zone, moitié, icône, `opens`, `solo` |
| [Disposition](LAYOUT.md) | Zones, moitiés, redimensionnement, et les planchers qui protègent le centre |
| [Hooks](HOOKS.md) | Piloter le châssis, depuis React et depuis l'extérieur |
| [Habillage](THEMING.md) | Tous les jetons, et comment un projet impose sa palette |
| [Composants](COMPONENTS.md) | Les pièces, et comment les remplacer une par une |
| [Onglets de documents](DOCKVIEW.md) | Le centre Dockview, optionnel |
| [Recettes](RECIPES.md) | Electron, une page existante, les raccourcis, les tests |
| [Architecture](../ARCHITECTURE.md) | Comment cela fonctionne à l'intérieur |

## Installation

```bash
pnpm add @pasquelin/panels
```

React 19 est une dépendance de pair. Rien d'autre n'est requis.

## Le plus petit exemple qui fonctionne

```tsx
import { Panels, Panel } from '@pasquelin/panels'
import '@pasquelin/panels/styles.css'

type PanelId = 'fichiers' | 'notes'

export function App() {
  return (
    <Panels<PanelId>>
      <Panel<PanelId> id="fichiers" zone="left" title="Fichiers" icon={<IconeFichiers />}>
        <ArbreFichiers />
      </Panel>

      <Panel<PanelId> id="notes" zone="right" title="Notes" icon={<IconeNote />}>
        <Notes />
      </Panel>

      <Panels.Center>
        <VotreApplication />
      </Panels.Center>
    </Panels>
  )
}
```

C'est tout. Les rails, les poignées de redimensionnement, la persistance et le clavier sont déjà là.

`<Panels>` remplit son parent : donnez donc une hauteur à ce parent — `height: 100%` jusqu'à la
racine, une cellule de grille, ou un enfant flex. Un châssis dans une boîte sans hauteur ne
dessine rien.

## Ce que ce n'est pas

C'est une **disposition**, pas un cadriciel. Il dessine le cadre et retient les tailles ; ce que
contiennent les panneaux regarde votre projet. Pas de gestion d'état, pas de couche de données,
pas de jeu d'icônes, pas d'internationalisation, et aucun avis sur ce que tient le centre.

## Le paramètre de type

Chaque composant prend l'union de vos identifiants de panneaux :

```tsx
type PanelId = 'fichiers' | 'recherche' | 'notes'

<Panels<PanelId>> … </Panels>
const { reveal } = usePanels<PanelId>()
```

Sans lui, les identifiants retombent sur `string`, ce qui fonctionne encore — vous perdez
seulement le compilateur qui refusait `reveal('note')` quand le panneau s'appelle `notes`.

## Licence

**MIT** — voir [LICENSE](../../LICENSE). Toutes les dépendances sont MIT également : aucune
obligation de copyleft dans l'arbre. Le détail est dans
[THIRD-PARTY-NOTICES.md](../../THIRD-PARTY-NOTICES.md).
