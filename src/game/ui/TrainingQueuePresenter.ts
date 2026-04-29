export type TrainingQueueItemView = {
  label: string
  progressPct: number
}

export class TrainingQueuePresenter {
  private readonly root: HTMLElement

  constructor(root: HTMLElement) {
    this.root = root
  }

  render(items: TrainingQueueItemView[]) {
    this.root.innerHTML = ''
    for (const item of items) {
      this.root.appendChild(this.createItem(item))
    }
  }

  private createItem(item: TrainingQueueItemView) {
    const div = document.createElement('div')
    div.className = 'train-item'

    const label = document.createElement('span')
    label.textContent = item.label
    div.appendChild(label)

    const bar = document.createElement('div')
    bar.className = 'train-bar'

    const fill = document.createElement('div')
    fill.className = 'train-fill'
    fill.style.width = `${Math.max(0, Math.min(100, item.progressPct))}%`
    bar.appendChild(fill)
    div.appendChild(bar)

    return div
  }
}
