# Habillage

🇬🇧 [This page in English](../en/THEMING.md) · [← Index](README.md)

Chaque valeur est une propriété personnalisée sur la racine du châssis. Il n'y a pas d'API
d'habillage au-delà de cela, parce qu'il n'en faut pas.

```css
.pnl-root {
  --pnl-panel: #101418;
  --pnl-accent: #47965c;
  --pnl-radius: 10px;
}
```

Portez-la où vous voulez — une classe sur `<Panels>`, un ancêtre, `:root`. Le châssis lit la
valeur calculée : tout ce qui l'atteint fonctionne.

```tsx
<Panels className="mon-theme">
```

## Les jetons

### Surfaces

| Jeton | Défaut (sombre) | |
| --- | --- | --- |
| `--pnl-chassis` | `#2b2d30` | Le cadre |
| `--pnl-panel` | `#191a1c` | Les surfaces posées dessus |
| `--pnl-elevated` | `#3c3f44` | Le survol, et une icône active du rail |
| `--pnl-border` | `#34363a` | Les séparateurs |
| `--pnl-text` | `#dfe1e5` | |
| `--pnl-muted` | `#91959b` | Texte secondaire, icônes au repos |

**Les panneaux sont plus sombres que le châssis.** Cette inversion est la seule idée visuelle sur
laquelle la bibliothèque est bâtie — c'est elle qui donne la lecture « panneaux posés sur un
cadre » plutôt que celle d'une page web. Inversez-la en repeignant deux jetons ; rien d'autre ne
suppose un sens.

### Accent

| Jeton | Défaut | |
| --- | --- | --- |
| `--pnl-accent` | `#346ef2` | Ce qu'on **actionne** : une icône active dans la zone focalisée |
| `--pnl-accent-text` | `#ffffff` | Ce qui s'écrit dessus |

Posez `--pnl-accent` sur n'importe quel ancêtre et le châssis prend votre identité au lieu
d'imposer la sienne.

Le défaut est un substitut, et le contraste de **votre** accent vous revient : le blanc dessus
demande 4,5:1 pour un mot, 3:1 pour un glyphe qui informe.

### Gauges

| Jeton | Défaut | |
| --- | --- | --- |
| `--pnl-rail` | `48px` | Largeur du rail |
| `--pnl-rail-button` | `36px` | Bouton d'icône du rail |
| `--pnl-rail-inset` | `14px` | |
| `--pnl-gutter` | `6px` | L'espace entre surfaces, **qui est la zone de redimensionnement** |
| `--pnl-header` | `40px` | Ligne de titre d'un panneau |
| `--pnl-radius` | `6px` | |
| `--pnl-radius-sm` | `4px` | |
| `--pnl-font-size` | `13px` | |

La gouttière n'est pas décorative : c'est **là** que le pointeur redimensionne. L'élargir élargit
la cible.

## Clair, sombre, et suivre le lecteur

Laissé seul, le châssis suit `prefers-color-scheme`. Pour le forcer :

```tsx
<Panels theme="dark">   // ou "light"
```

La palette claire est le **miroir** de la sombre, pas son inversion : les surfaces se détachent du
châssis en étant plus claires, le châssis devenant une gouttière grise autour de panneaux blancs.

## Pourquoi votre palette gagne toujours

Chaque jeton par défaut est déclaré dans `:where()`, qui ne porte **aucune spécificité**. Tout ce
que vous écrivez — une classe, un identifiant, un sélecteur d'élément — l'emporte, quel que soit
l'ordre de chargement des feuilles.

Ce fut un défaut : les défauts vivaient sur `.pnl-root:not([data-pnl-theme='light'])`, qui pèse
plus lourd que n'importe quelle classe, si bien que la palette d'un projet s'appliquait dans le
sombre et disparaissait dès que le système du lecteur demandait le clair. Une garde lit désormais
la feuille pour que tout reste à zéro.

## Au-delà de la couleur

Si les jetons ne suffisent pas, chaque pièce est exportée et remplaçable seule — voir
[Composants](COMPONENTS.md). Et si vous ne voulez rien du rendu, les [hooks](HOOKS.md) ne
dessinent rien du tout.
