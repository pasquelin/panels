/*
 * Le peu de comportement que la vitrine demande : copier la ligne d'installation, et dire
 * où l'on est dans la page.
 *
 * Sans dépendance et sans bundler, comme le reste de `site/` : la page se sert telle quelle.
 * Ce qui a vraiment besoin de React — le chassis — est une démo à part, dans son cadre.
 */

/* La ligne d'installation, copiée d'un clic. Le libellé revient de lui-même : un état qui
   reste allumé laisse croire à un mode plutôt qu'à un accusé de réception. */
for (const bouton of document.querySelectorAll('[data-copy]')) {
  const etat = bouton.querySelector('.install__state')
  let minuterie

  bouton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(bouton.dataset.copy)
    } catch {
      // Presse-papier refusé (page non sécurisée, permission). Le texte reste sélectionnable.
      return
    }
    if (!etat) return
    etat.textContent = etat.dataset.copyDone
    clearTimeout(minuterie)
    minuterie = setTimeout(() => {
      etat.textContent = etat.dataset.copyIdle
    }, 1600)
  })
}

/* La pastille allumée du rail suit la section au milieu de l'écran. Les marges opposées
   réduisent la zone d'observation à une bande centrale : sans elles, deux sections sont
   visibles à la fois et la pastille papillonne. */
const pastilles = new Map()
for (const lien of document.querySelectorAll('.railnav__dot[data-section]')) {
  pastilles.set(lien.dataset.section, lien)
}

const observateur = new IntersectionObserver(
  (entrees) => {
    const vue = entrees.find((entree) => entree.isIntersecting)
    if (!vue) return
    for (const [id, lien] of pastilles) {
      const ici = id === vue.target.id
      lien.classList.toggle('railnav__dot--on', ici)
      if (ici) lien.setAttribute('aria-current', 'true')
      else lien.removeAttribute('aria-current')
    }
  },
  { rootMargin: '-45% 0px -45% 0px' },
)

for (const id of pastilles.keys()) {
  const section = document.getElementById(id)
  if (section) observateur.observe(section)
}
