# Disposition

🇬🇧 [This page in English](../en/LAYOUT.md) · [← Index](README.md)

```
┌──────────────────────────────────────────────────────────┐
│ en-tête (le vôtre, ou rien)                              │
├──┬────────────────────────────────────────────────────┬──┤
│  │                     top                            │  │
│R │────────────────────────────────────────────────────│R │
│A │  left      │                        │   right      │A │
│I │  primary   │                        │   primary    │I │
│L │  ┄┄┄┄┄┄┄   │        CENTRE          │   ┄┄┄┄┄┄┄    │L │
│  │  secondary │                        │   secondary  │  │
│  │────────────┴────────────────────────┴──────────────│  │
│  │  bottomLeft         ┊        bottomRight           │  │
├──┴────────────────────────────────────────────────────┴──┤
│ pied (le vôtre, ou rien)                                 │
└──────────────────────────────────────────────────────────┘
   ┄┄┄  poignée entre les deux moitiés d'une zone
   │    poignée entre une zone et le centre
   ┊    poignée entre les deux moitiés de la bande
```

## Cinq zones, deux moitiés chacune

`left`, `right`, `top`, `bottomLeft`, `bottomRight`. **Une zone que personne ne remplit ne prend
aucune place** — ni largeur, ni poignée, rien.

Chaque zone est coupée en deux : `primary` est la moitié la plus proche du bord de fenêtre dont la
zone dépend — le haut d'une colonne, la gauche de la bande basse.

## La bande est une seule bande

`bottomLeft` et `bottomRight` partagent **une hauteur**. Celle des deux qui est seule court sous
la colonne opposée ; ensemble, elles se partagent la largeur, séparées par une poignée qui part du
milieu.

C'est aussi pourquoi une colonne latérale court jusqu'au pied du cadre **sauf si** la moitié de la
bande de son côté dessine.

## Le centre

Ce que vous mettez dans `<Panels.Center>`. Il reste au même endroit de l'arbre React à travers
tous les arrangements des zones autour de lui — déplacé, React le démonterait et emporterait avec
lui le moteur, le canvas ou l'éditeur qu'il tient.

## Redimensionnement

Trois poignées, trois questions différentes :

| Poignée | Déplace |
| --- | --- |
| Entre une zone et le centre | la longueur propre de la zone |
| Entre les deux moitiés d'une zone | le partage à l'intérieur |
| Entre les deux zones de la bande | leur partage de la largeur |

Chacune est un `role="separator"`, atteignable à la <kbd>Tab</kbd> et pilotée aux flèches — un
séparateur qui ne répond qu'au pointeur est un contrôle qu'un utilisateur au clavier ne peut pas
manœuvrer du tout.

## Les planchers

| | |
| --- | --- |
| `MIN_SIZE` | 140 — le minimum d'une zone traînée |
| `MIN_CENTER` | 240 — la place que le centre garde toujours |
| `MIN_SPLIT` | 100 — la place qu'une moitié garde dans sa zone |

Une zone est bornée contre **ce que la zone opposée prend déjà**. Plafonner chaque côté à la
moitié du conteneur indépendamment laisserait la gauche et la droite additionner toute la largeur,
et le centre tomber à zéro — puis déborder dès que le conteneur rétrécit.

Cette borne s'applique que quelque chose ait été traîné ou non. Deux colonnes intactes demandant
320 et 380 dans un conteneur de 900 px ne laissent pas 104 px au centre : elles cèdent au prorata
de ce qu'elles demandaient, si bien qu'aucune ne s'effondre pendant que l'autre garde sa largeur.

## Il mesure son conteneur, pas la fenêtre

Le châssis observe **sa propre boîte**. Placez-le dans une route, sous votre navigation, à côté de
votre barre latérale — les planchers suivent la boîte où il se trouve réellement.

C'est ce qui permet de l'adopter pièce par pièce dans une application qui existe déjà.

## Persistance

Ce qui est stocké : quelle moitié tient quel panneau, et les tailles. C'est tout.

```tsx
<Panels
  storageKey="mon-app:disposition"   // deux châssis dans une app : deux clés
  storage={monStockage}              // ou null pour ne rien stocker
>
```

Le focus et la mise de côté d'un panneau solo sont un état de session, délibérément non écrit.

Un stockage sur mesure tient en deux fonctions :

```ts
const storage = {
  read: (key: string) => string | null,
  write: (key: string, value: string) => void,
}
```

Une disposition écrite par une autre version, ou corrompue, est **abandonnée plutôt que lue à
moitié** : vos défauts sont un arrangement délibéré, une disposition cassée non. Les zones
inconnues, les moitiés inconnues et les valeurs du mauvais type sont écartées à la lecture.
