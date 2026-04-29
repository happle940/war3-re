export class ModeHintPresenter {
  private readonly root: HTMLElement

  constructor(root: HTMLElement) {
    this.root = root
  }

  show(text: string) {
    this.root.textContent = text
    this.root.style.display = text ? 'block' : 'none'
  }

  flashGroup(slot: number, count: number, summary: string) {
    this.show(`编组 ${slot} — ${count} 个单位${summary ? ' (' + summary + ')' : ''}`)
  }

  flashCommand(text: string, state: 'ok' | 'blocked') {
    this.root.dataset.state = state
    this.show(text)
  }

  clearState() {
    delete this.root.dataset.state
  }
}
