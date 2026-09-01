import { NavLink, Outlet, RouterProvider, createHashRouter, useParams } from 'react-router-dom'
import { Panel, Panels } from '@pasquelin/panels'
import { AlertIcon, ChatIcon, MapIcon, TuneIcon } from '../../src/icons'
import { ExampleChrome } from '../../src/ExampleChrome'

type PanelId = 'sites' | 'alerts' | 'details' | 'chat'

/**
 * The point of this example: the panels are declared ONCE, around an <Outlet/>. Navigating
 * changes what the centre draws and nothing else — the columns keep their width, the open
 * panels stay open, and no state is threaded through the router to make that happen.
 */
function Layout() {
  return (
    <Panels<PanelId> storageKey="panels-example:router">
      <Panel<PanelId> id="sites" zone="left" title="Sites" icon={<MapIcon />}>
        <nav className="rows">
          {SITES.map(site => (
            <NavLink
              key={site.id}
              to={`/site/${site.id}`}
              className={({ isActive }) => (isActive ? 'row row--on' : 'row')}
            >
              {site.name}
            </NavLink>
          ))}
        </nav>
      </Panel>

      <Panel<PanelId> id="alerts" zone="left" title="Alerts" icon={<AlertIcon />}>
        <div className="rows">
          {SITES.filter(site => site.alerts > 0).map(site => (
            <NavLink key={site.id} to={`/site/${site.id}`} className="row">
              {site.name} — {site.alerts}
            </NavLink>
          ))}
        </div>
      </Panel>

      <Panel<PanelId>
        id="details"
        zone="right"
        slot="secondary"
        title="Details"
        icon={<TuneIcon />}
      >
        <Details />
      </Panel>

      <Panel<PanelId> id="chat" zone="right" title="Notes" icon={<ChatIcon />} opens={320}>
        <p className="note">The route changed, this panel did not. That is the whole example.</p>
      </Panel>

      <Panels.Center>
        {/* The router owns the middle. The chassis never re-mounts it. */}
        <Outlet />
      </Panels.Center>
    </Panels>
  )
}

const SITES = [
  { id: 'north', name: 'North gate', alerts: 2 },
  { id: 'depot', name: 'Depot', alerts: 0 },
  { id: 'roof', name: 'Roof access', alerts: 1 },
  { id: 'yard', name: 'Yard', alerts: 0 },
]

function Details() {
  const { id } = useParams()
  const site = SITES.find(one => one.id === id)

  if (!site) return <p className="note">Pick a site to see its details.</p>
  return (
    <dl className="facts">
      <dt>Name</dt>
      <dd>{site.name}</dd>
      <dt>Alerts</dt>
      <dd>{site.alerts}</dd>
      <dt>Route</dt>
      <dd>/site/{site.id}</dd>
    </dl>
  )
}

function SitePage() {
  const { id } = useParams()
  const site = SITES.find(one => one.id === id)

  return (
    <div className="centre">
      <h1>{site?.name ?? 'Unknown site'}</h1>
      <p>
        Only this middle changed. Resize a column, open a panel, then move between sites — the
        chassis stays exactly as you left it.
      </p>
    </div>
  )
}

function Home() {
  return (
    <div className="centre">
      <h1>Pick a site</h1>
      <p>The list on the left is a set of routes. The panels around it never re-mount.</p>
    </div>
  )
}

// Hash routing, so the example works on GitHub Pages without server rewrites.
const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'site/:id', element: <SitePage /> },
    ],
  },
])

export function App() {
  return (
    <ExampleChrome
      title={{ en: 'React Router', fr: 'React Router' }}
      lead={{
        en: 'The centre is an <Outlet/>. Panels are declared once and outlive every navigation.',
        fr: 'Le centre est une route. Les panneaux sont déclarés une fois et survivent à chaque navigation.',
      }}
    >
      <RouterProvider router={router} />
    </ExampleChrome>
  )
}
