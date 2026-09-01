# Recettes

🇬🇧 [This page in English](../en/RECIPES.md) · [← Index](README.md)

## Dans une application qui existe déjà

Le châssis mesure **son propre conteneur** : il n'a pas besoin de posséder la fenêtre.

```tsx
<div className="mon-app">
  <MaNavigation />
  <section style={{ flex: 1, minHeight: 0 }}>
    <Panels<PanelId>>…</Panels>
  </section>
</div>
```

La seule exigence est que la boîte ait une hauteur. `minHeight: 0` sur un enfant flex est la pièce
qui manque d'habitude — sans elle, l'enfant refuse de rétrécir et le châssis déborde.

## Un en-tête entièrement à vous

`<Panels>` ne dessine aucune chrome. Passez la vôtre, ou rien :

```tsx
<Panels header={<MonEnTete />} footer={<MaBarreDEtat />}>
```

Tout ce qui s'y trouve peut piloter le châssis avec [`usePanels`](HOOKS.md) — sans avoir besoin de
savoir ce qu'est une zone.

## Electron

Rien n'est spécifique à Electron, mais deux choses méritent d'être câblées.

**Le menu natif**, qui vit dans le processus principal et ne peut pas appeler de hook :

```tsx
const store = createPanelsStore<PanelId>()

window.electron.onMenuItem(id => store.getState().show(id))

<Panels<PanelId> store={store}>…</Panels>
```

**La persistance sur disque** plutôt que dans `localStorage` :

```tsx
<Panels
  storage={{
    read: cle => window.electron.readLayout(cle),
    write: (cle, valeur) => window.electron.writeLayout(cle, valeur),
  }}
>
```

La zone de déplacement d'une fenêtre sans cadre regarde votre en-tête : posez-y
`WebkitAppRegion: 'drag'`, et `'no-drag'` sur les contrôles qu'il contient.

## Raccourcis clavier

```tsx
function Raccourcis() {
  const { toggle } = usePanels<PanelId>()

  useEffect(() => {
    const surTouche = (evenement: KeyboardEvent) => {
      if (evenement.metaKey && evenement.key === 'b') toggle('fichiers')
    }
    window.addEventListener('keydown', surTouche)
    return () => window.removeEventListener('keydown', surTouche)
  }, [toggle])

  return null
}
```

Rendez-le à l'intérieur de `<Panels>`, comme tout autre consommateur du hook.

## Deux châssis dans une application

Donnez-leur des clés de stockage différentes, sinon ils écrasent mutuellement leur disposition :

```tsx
<Panels storageKey="app:principal">…</Panels>
<Panels storageKey="app:rapport">…</Panels>
```

Chaque `<Panels>` fabrique son propre store ; rien n'est partagé entre eux.

## Tests

Le châssis est du React ordinaire. Donnez-lui un stockage qui oublie, pour qu'un test ne fuie pas
dans le suivant :

```tsx
import { memoryStorage } from '@pasquelin/panels'

render(
  <Panels storage={memoryStorage()}>
    <Panel id="fichiers" zone="left" title="Fichiers">
      <p>liste de fichiers</p>
    </Panel>
  </Panels>,
)

await user.click(screen.getByRole('button', { name: 'Fichiers' }))
```

Tout est atteignable par rôle : le rail est un `toolbar`, les panneaux sont des `region` nommées
par leur titre, les poignées sont des `separator`.

Notez que jsdom ne calcule aucune mise en page : `useContainerFit` mesure donc zéro et les zones
gardent la taille qu'elles demandent. C'est assez pour tester ce qui est ouvert et ce qui ne l'est
pas ; ce n'est pas assez pour tester les planchers — ceux-là sont testés unitairement contre
`sharedSizes`.

## Rendu côté serveur

Le châssis lit `localStorage` et mesure le DOM : sa place est côté client. Sous Next.js, marquez
le fichier `'use client'` ; il n'y a de toute façon rien d'utile à rendre côté serveur, la
disposition appartenant au lecteur.
