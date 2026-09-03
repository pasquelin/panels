# Composants

🇬🇧 [This page in English](../en/COMPONENTS.md) · [← Index](README.md)

Trois niveaux d'adoption, et vous pouvez vous arrêter à n'importe lequel : prendre le châssis
entier, remplacer une pièce, ou ne prendre que les [hooks](HOOKS.md) et tout dessiner vous-même.

## Ce qui est exporté

| | |
| --- | --- |
| `Panels` | Le châssis. Collecte les descripteurs et assemble le cadre |
| `Panel` · `Center` | Des descripteurs. Jamais rendus là où ils sont écrits |
| `Rail` · `RailZone` | Le rail d'icônes, et le groupe d'icônes d'une zone |
| `ZoneEdge` | Une zone : ses deux moitiés et sa poignée |
| `Band` | La bande basse, et ses deux zones |
| `PanelFrame` | Un panneau à l'écran : surface, ligne de titre, corps |
| `Surface` | La boîte arrondie |
| `PanelHeader` | La ligne de titre |
| `IconButton` | Le bouton du rail, et celui de l'en-tête |
| `Separator` · `ResizeHandle` | |
| `DEFAULT_LABELS` | Tous les mots que dit le châssis |

## Remplacer une pièce

Construisez votre propre cadre avec celles que vous gardez :

```tsx
import { PanelsProvider, Rail, ZoneEdge, useBandHalves } from '@pasquelin/panels'

function MonChassis({ children }) {
  const bande = useBandHalves()

  return (
    <PanelsProvider>
      <div className="mon-cadre">
        <MonPropreRail side="left" />
        <ZoneEdge zone="left" labels={MES_MOTS} />
        <main>{children}</main>
        <Rail side="right" />
      </div>
    </PanelsProvider>
  )
}
```

`<Panels>` n'est lui-même qu'un fournisseur plus un agencement de ces pièces — il n'y a rien
dedans que vous ne puissiez écrire vous-même.

## Les mots

Le châssis dit quatre choses. Elles sont en anglais par défaut ; passez les vôtres, déjà
traduites :

```tsx
<Panels
  labels={{
    closePanel: 'Fermer le panneau',
    resizeZone: 'Redimensionner la zone',
    resizeSplit: 'Redimensionner les deux panneaux',
    resizeBand: 'Redimensionner la bande',
  }}
>
```

La bibliothèque ne porte **aucune internationalisation**. Une clé imposerait un espace de nommage
à tout projet qui l'installe, et traduire est quelque chose que votre application sait déjà faire.

## Noms de classes

Chaque classe est préfixée `pnl-`. Elles font partie de la surface publique — habillez-les,
surchargez-les, visez-les dans vos tests :

```
pnl-root · pnl-middle · pnl-columns · pnl-row · pnl-stack · pnl-centre
pnl-rail · pnl-rail__group · pnl-rail__button · pnl-rail__drop · pnl-rail__button-wrap
pnl-rail-drag__placeholder · pnl-rail-drag__empty · pnl-rail-drag__ghost
pnl-zone · pnl-band · pnl-surface · pnl-body
pnl-header · pnl-header__title · pnl-header__actions · pnl-header__trailing
pnl-icon-button · pnl-separator · pnl-handle
```

## Accessibilité

Ce que le châssis fait pour vous :

- le rail est un `role="toolbar"`, ses boutons portent `aria-pressed`
- chaque panneau est une `<section>` nommée par son titre
- chaque poignée est un `role="separator"` avec `aria-orientation`, `aria-valuenow` et ses bornes,
  focalisable et pilotée aux flèches
- une poignée ne prend que le bouton principal du pointeur principal, et garde le geste au
  toucher plutôt que de laisser la page défiler
- l'anneau de focus est visible et `prefers-reduced-motion` est respecté

Ce qui vous revient : le contraste de votre palette, et les noms accessibles de ce que vous mettez
dans les panneaux.

## Dessiner les boutons soi-même

Le châssis dessine deux boutons que vous n'atteignez pas : celui du rail, et la fermeture d'un
en-tête de panneau. Remplacez-les plutôt que de les configurer — une infobulle, un rappel de
raccourci, une pastille appartiennent à votre design system, pas à une librairie de disposition.

```tsx
<Panels components={{ IconButton: MonIconButton }}>
```

`MonIconButton` reçoit `IconButtonProps` : `icon`, `label`, `active`, `accented`, `acts`,
`onClick`, plus ce que vous ajoutez. `acts` distingue la fermeture d'une bascule du rail.

Lu **une seule fois**, comme `storage` : un objet écrit en ligne change d'identité à chaque rendu,
et tous les panneaux se re-rendraient avec lui.
