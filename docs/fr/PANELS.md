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

## `fillActions`

Un panneau d'une zone horizontale reçoit la largeur libre de son en-tête pour ses actions — juste
pour une barre de montage, faux pour une bande qui tient une liste et deux boutons. Dites lequel
est le vôtre :

```tsx
<Panel id="problems" zone="bottomRight" title="Problèmes" fillActions={false} actions={…}>
```

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

## Déplacer les panneaux

Un lecteur peut faire glisser une icône de rail vers une autre moitié — l'autre moitié de la même
colonne, la colonne d'en face, l'un ou l'autre bout du bandeau. Toute moitié qu'un rail dessine
accepte un dépôt, et les vides se montrent le temps qu'un panneau est porté.

N'importe où dans un rail est un dépôt : la moitié d'arrivée est celle de ce rail la plus
**proche** du pointeur, et non celle qu'il survole. Une moitié n'est haute que de ses icônes, et un
lecteur qui vise l'espace sous la dernière vise bien cette moitié.

Une zone qui ne tient **rien** offre une seule place et non deux : `primary` et `secondary` ne sont
deux destinations qu'une fois qu'il y a quelque chose dans la zone à surmonter ou à suivre.

C'est **désactivé par défaut** : un châssis dont les icônes bougent sous le pointeur n'est pas ce
que tout projet veut.

```tsx
<Panels<PanelId> draggablePanels>
```

Le panneau garde la zone et la moitié où il a été lâché, et ce choix est stocké avec le reste de
la disposition. Votre déclaration n'est pas écrasée — elle est ce vers quoi le panneau **retombe**.
Lâchez un panneau là où le projet l'avait déjà mis et la dérogation est retirée plutôt qu'écrite
comme une coïncidence : le panneau suit de nouveau la déclaration le jour où vous la changez.

Un panneau qui était à l'écran quand on l'a saisi est à l'écran là où il atterrit. Un panneau qui
ne l'était pas ne bouge que sur le papier : ouvrir une colonne que le lecteur n'a pas demandée
serait une drôle de réponse à un glissement.

Les panneaux `solo` atterrissent toujours en `primary`, quelle que soit la moitié visée — un
panneau solo fait taire l'autre moitié, et un solo posé en `secondary` ferait taire celle où il se
tient.

## `placementScope`

L'endroit où les panneaux se tiennent suit `view`, sauf mention contraire :

```tsx
<Panels<PanelId> view={enRevue ? 'review' : 'edit'} placementScope="shared" draggablePanels>
```

Les deux vues gardent alors leurs propres **panneaux ouverts** tout en partageant une seule
**disposition des rails** : un lecteur qui place Recherche sous Fichiers le fait une fois, et non
une fois par écran. Omise, chaque vue arrange ses rails pour elle seule.

## Déplacer un panneau depuis votre code

`movePanel` est sur le store et sur `usePanelsActions`, pour un menu, un raccourci ou un test :

```tsx
store.getState().movePanel('files', { zone: 'right', slot: 'secondary' }, 0)
```

Le dernier argument est la position **dans cette moitié**, comptée parmi les panneaux qui s'y
trouvent déjà — `0` le met en tête, au-delà de la fin le met en queue.
