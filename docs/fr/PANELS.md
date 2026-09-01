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

`defaultOpen` est lu une seule fois par vue, et jamais contre une disposition restaurée — un
arrangement que le lecteur a fait l'emporte sur un défaut.

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

Le registre suit votre JSX, dans l'ordre où vous le déclarez. Un panneau qui cesse d'être déclaré
quitte le rail, et la moitié qu'il tenait **retombe** sur ce qui est encore déclaré pour elle :
elle n'est pas fermée, et le choix n'est pas oublié. Déclarez-le à nouveau et la moitié lui
revient, à la place qu'il avait.

Les panneaux conditionnels fonctionnent comme vous l'attendez :

```tsx
{projet && (
  <Panel id="git" zone="left" slot="secondary" title="Historique">…</Panel>
)}
```

C'est ainsi qu'on exprime ce à quoi servirait un système de capacités : un panneau qu'il ne faut
pas offrir est un panneau qu'on ne déclare pas. Et comme un retrait ne coûte rien, un panneau peut
aller et venir aussi souvent qu'un droit, une route ou une connexion.

## Les vues

Deux parties d'une même application peuvent vouloir leur propre disposition — un éditeur et un
écran de revue, un projet et un tableau de bord. Nommez celle qui est devant, et chacune garde les
panneaux qu'elle avait ouverts :

```tsx
<Panels<PanelId> view={enRevue ? 'review' : 'edit'}>
```

Fermer une colonne dans une vue la laisse ouverte dans l'autre, et y revenir la retrouve telle
qu'on l'a laissée. Les **longueurs sont communes** : une colonne qui changerait de largeur en
chemin se lirait comme une autre fenêtre.

Omise, tout arrive dans une seule vue et rien de ceci ne se voit. Une vue ne coûte rien à ignorer,
et un projet qui en gagne une seconde n'a qu'une prop à passer.

La prop est **contrôlée** : elle est réconciliée à chaque rendu, donc un `setView` appelé dans son
dos est repris au suivant. Et les vues ne sont jamais purgées — nommez la poignée d'écrans qui
possèdent une disposition plutôt que chaque route, sans quoi `view={location.pathname}` fait
croître une entrée stockée par URL, pour toujours.
