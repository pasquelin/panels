import {
  NavLink,
  Outlet,
  RouterProvider,
  createHashRouter,
  useLocation,
  useParams,
} from 'react-router-dom'
import { Panel, Panels } from '@pasquelin/panels'
import { AlertIcon, ChatIcon, DocIcon, LayersIcon, MapIcon, TuneIcon } from '../../src/icons'
import { ExampleChrome } from '../../src/ExampleChrome'

type PanelId = 'sites' | 'alerts' | 'details' | 'chat' | 'reports' | 'filters'

/**
 * The point of this example, in two halves.
 *
 * Around the sites, the panels are declared ONCE and navigating changes what the centre draws
 * and nothing else — the columns keep their width and the open panels stay open.
 *
 * The reports section is the other half: it declares its OWN panels, and says so with `view`.
 * Each view keeps the panels it had open to itself, so closing a column here does not close it
 * there — and the lengths stay shared, because a column that changed width on the way would
 * read as another window.
 */
function Layout() {
  // Two sections, and the second declares panels the first does not have. A panel that should
  // not be offered is a panel you do not declare — there is no capability system to learn.
  const reports = useLocation().pathname.startsWith('/reports')

  return (
    <Panels<PanelId>
      storageKey="panels-example:router"
      view={reports ? 'reports' : 'sites'}
      // Named, because an unnamed half opens on the panel declared FIRST for it — which is
      // `sites`, declared above for every view. Declaration order is the default; this is how a
      // view says it wants another.
      defaultOpen={reports ? { left: { primary: 'reports' } } : undefined}
    >
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

      {reports && (
        <Panel<PanelId> id="reports" zone="left" title="Reports" icon={<DocIcon />}>
          <div className="rows">
            {REPORTS.map(report => (
              <span key={report} className="row">
                {report}
              </span>
            ))}
          </div>
        </Panel>
      )}

      {reports && (
        <Panel<PanelId>
          id="filters"
          zone="left"
          slot="secondary"
          title="Filters"
          icon={<LayersIcon />}
        >
          <p className="note">
            Only this section declares these two. Leave and come back: they are as you left them.
          </p>
        </Panel>
      )}

      <Panels.Center>
        {/* The router owns the middle. The chassis never re-mounts it. */}
        <Outlet />
      </Panels.Center>
    </Panels>
  )
}

const REPORTS = ['Weekly rounds', 'Access log', 'Incidents', 'Maintenance']

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
      <p>
        <NavLink to="/reports" className="row">
          Go to reports →
        </NavLink>{' '}
        another section, with panels of its own and an arrangement it keeps to itself.
      </p>
    </div>
  )
}

function ReportsPage() {
  return (
    <div className="centre">
      <h1>Reports</h1>
      <p>
        The left column now holds two panels this section alone declares. Close one, go back to a
        site, and return: this section finds it closed, and the sites never lost theirs.
      </p>
      <p>
        <NavLink to="/" className="row">
          ← Back to the sites
        </NavLink>
      </p>
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
      { path: 'reports', element: <ReportsPage /> },
    ],
  },
])

export function App() {
  return (
    <ExampleChrome example="router">
      <RouterProvider router={router} />
    </ExampleChrome>
  )
}
