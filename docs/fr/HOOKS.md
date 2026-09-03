# Hooks

🇬🇧 [This page in English](../en/HOOKS.md) · [← Index](README.md)

Les composants sont bâtis dessus. Prenez-les et dessinez votre propre cadre, ou servez-vous-en
depuis un en-tête qui ne connaît rien aux zones.

## `usePanels`

Tout ce dont un en-tête, un raccourci ou un menu a besoin.

```tsx
const { panels, reveal, close, toggle, isShown, focusedZone, reset } = usePanels<PanelId>()
```

| | |
| --- | --- |
| `panels` | Tous les panneaux déclarés, **tels que le lecteur les a arrangés** — ordre, zone et moitié |
| `reveal(id)` | Le lève dans la moitié qu'il a déclarée, et focalise sa zone |
| `close(id)` | Ferme **ce** panneau, ou rien |
| `toggle(id)` | Ce que fait une icône du rail |
| `isShown(id)` | S'il est à l'écran en ce moment |
| `focusedZone` | La dernière zone cliquée, ou `null` |
| `reset()` | Retour à l'arrangement d'ouverture |

`close(id)` porte sur le panneau, pas sur la moitié : deux panneaux partagent une moitié, et
fermer « la moitié » fermerait celui qui s'y trouvait et annoncerait un succès.

Un en-tête bâti là-dessus suit le châssis quoi qu'il le fasse bouger — un clic du rail, un
raccourci clavier, un message de socket :

```tsx
function EnTete() {
  const { panels, isShown, toggle } = usePanels<PanelId>()

  return (
    <nav>
      {panels.map(panneau => (
        <button
          key={panneau.id}
          aria-pressed={isShown(panneau.id)}
          onClick={() => toggle(panneau.id)}
        >
          {panneau.title}
        </button>
      ))}
    </nav>
  )
}
```

⚠️ Il doit être appelé **à l'intérieur** de `<Panels>`. Un composant qui rend le châssis ne peut
pas aussi le lire — mettez le bouton dans un enfant, ou dans les `actions` d'un panneau.

## `useZone`

Ce qu'il faut à une zone pour se dessiner.

```tsx
const { primary, secondary, draws, size, split, focused } = useZone<PanelId>('left')
```

`primary` et `secondary` sont les panneaux que la zone **dessine** réellement, ce qui n'est pas
toujours ce qu'elle tient — un panneau `solo` fait taire l'autre moitié. `size` est déjà bornée
contre la zone opposée et la place mesurée.

## `useShownIn`, `useZoneDraws`, `useZoneTakesRoom`, `useBandHalves`

Des questions plus petites, pour un cadre à vous.

`useZoneTakesRoom` n'est pas `useZoneDraws` : les deux moitiés de la bande partagent une hauteur,
donc l'une des deux qui dessine signifie que la bande prend cette hauteur. Posez la mauvaise
question et une zone peut être traînée par-dessus la place que la bande occupe déjà.

## `useContainerFit`

Reborne les zones quand votre conteneur change de taille.

```tsx
const boite = useRef<HTMLDivElement>(null)
useContainerFit(boite)
```

Nécessaire seulement si vous construisez votre propre cadre — `<Panels>` le fait déjà, sur la
boîte que les zones et le centre partagent plutôt que sur le châssis entier.

## Hors de React

Construisez le store vous-même et gardez la référence :

```tsx
const store = createPanelsStore<PanelId>()

socket.on('alerte', () => store.getState().show('alertes'))
window.electron?.onMenu(id => store.getState().show(id))

<Panels<PanelId> store={store}>…</Panels>
```

`store.getState()` donne les mêmes actions que celles qu'appellent les hooks : `show`, `close`,
`toggle`, `movePanel`, `focus`, `resize`, `resplit`, `resplitBand`, `fit`, `reset` — plus
`declare` et
`setView`, que le châssis pilote lui-même.

Dans React, la prop `view` est le seul chemin pour changer de vue : elle est contrôlée et
réconciliée à chaque rendu, donc un `setView` fait dans son dos est repris au suivant.
`usePanelsActions` ne l'offre donc pas — un seul chemin par question.

## `usePanelsState`

N'importe quelle tranche, abonnée :

```tsx
const open = usePanelsState<PanelId, OpenByZone<PanelId>>(state => state.views[state.view])
```

La disposition de la vue à l'écran — `openOf(state)` dit la même chose à partir d'un état qu'on
tient déjà.

Préférez les sélecteurs scalaires. `lengths` et `available` sont remplacés en entier à chaque
écriture : s'abonner à l'un ou l'autre comme objet réveille votre composant à chaque image d'un
glissement.
