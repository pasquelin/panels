# Panneaux

🇬🇧 [This page in English](../en/PANELS.md) · [← Index](README.md)

Un panneau se déclare avec `<Panel>`, qui est un **descripteur** : il n'est jamais rendu là où
vous l'écrivez. `<Panels>` lit ses propriétés pour construire le rail et confie ses enfants à la
zone qu'il a nommée.

```tsx
<Panel<PanelId>
  id="fichiers"
  zone="left"
  slot="primary"
  title="Fichiers"
  icon={<IconeFichiers />}
  actions={<BoutonRafraichir />}
  opens={320}
>
  <ArbreFichiers />
</Panel>
```

## Propriétés

| Propriété | Requise | Sens |
| --- | --- | --- |
| `id` | oui | Unique, et le paramètre de type de `<Panels>` |
| `zone` | oui | `left`, `right`, `top`, `bottomLeft`, `bottomRight` |
| `slot` | non | `primary` (côté bord) ou `secondary`. `primary` par défaut |
| `title` | oui | Nom accessible et titre d'en-tête, **déjà traduit** |
| `icon` | non | Tout ce que React sait rendre. Aucun jeu d'icônes n'est imposé |
| `actions` | non | Rendues sur la ligne de titre du panneau, à côté de son nom |
| `opens` | non | La taille que ce panneau demande quand il mène sa zone |
| `solo` | non | Prend la zone entière. `primary` seulement |

## Partager une moitié

Deux panneaux de même `zone` et de même `slot` **prennent leur tour** : le rail bascule entre eux,
et un seul est à l'écran à la fois.

```tsx
<Panel id="fichiers" zone="left" title="Fichiers">…</Panel>
<Panel id="recherche" zone="left" title="Recherche">…</Panel>
```

Pour les montrer **ensemble**, empilés, mettez le second dans l'autre moitié :

```tsx
<Panel id="fichiers" zone="left" title="Fichiers">…</Panel>
<Panel id="plan" zone="left" slot="secondary" title="Plan">…</Panel>
```

Le rail dessine la même coupe sous forme de séparateur : les icônes au-dessus ouvrent dans la
première moitié, celles en dessous dans la seconde. Le rail est la légende de la colonne.

## Quel panneau s'ouvre en premier

Une moitié dont rien n'a été choisi s'ouvre sur le **premier panneau déclaré pour elle**. L'ordre
de déclaration compte donc : placez d'abord le panneau sur lequel un lecteur doit arriver.

Pour ouvrir ailleurs, nommez les moitiés vous-même :

```tsx
<Panels<PanelId> defaultOpen={{ left: { primary: 'recherche' } }}>
```

`defaultOpen` est lu une seule fois, et jamais contre une disposition restaurée — un arrangement
que le lecteur a fait l'emporte sur un défaut.

## `opens`

Une zone a une largeur propre (320 pour `left`, 260 pour `right`, 180 pour `top`, 240 pour la
bande). Un panneau qui a besoin de plus le dit :

```tsx
<Panel id="assistant" zone="right" title="Assistant" opens={460}>
```

Une taille que le lecteur a traînée l'emporte toujours : une longueur que quelqu'un a choisie est
une réponse sur la **colonne**, pas sur le panneau qui s'y trouvait.

## `solo`

Un panneau `solo` prend sa zone **entière** ; l'autre moitié ne dessine rien tant qu'il est levé.

```tsx
<Panel id="assistant" zone="right" title="Assistant" solo opens={460}>
```

La moitié qu'il fait taire est **mise de côté, pas fermée**. Fermez le panneau solo et ce qui
était là revient intact. Cette mise de côté n'est jamais persistée : une colonne qui se rouvrirait
toute seule trois jours plus tard, sur un arrangement dont personne ne se souvient, n'est pas une
restauration.

`solo` ne vaut que pour `primary`.

## Ajouter et retirer des panneaux

Le registre suit votre JSX. Un panneau qui cesse d'être déclaré est retiré, et la moitié qu'il
occupait est vidée — un identifiant stocké nommant un panneau qui n'existe plus laisserait sinon
un cadre sans rien à dessiner dedans.

Les panneaux conditionnels fonctionnent comme vous l'attendez :

```tsx
{projet && (
  <Panel id="git" zone="left" slot="secondary" title="Historique">…</Panel>
)}
```

C'est ainsi qu'on exprime ce à quoi servirait un système de capacités : un panneau qu'il ne faut
pas offrir est un panneau qu'on ne déclare pas.
