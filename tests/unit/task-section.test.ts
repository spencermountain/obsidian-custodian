import test from 'tape'
import parsePage from '../lib.ts'

test('task sections expose checked state and live editing', (t) => {
  const page = parsePage('- Plain\n- [ ] Todo\n- [x] Done')
  const [todo, done] = page.tasks()
  t.ok(Object.hasOwn(Object.getPrototypeOf(todo), 'checked'), 'task class owns the checked accessor')
  t.equal(todo.checked, false)
  t.equal(done.checked, true)
  t.equal(todo.text(), 'Todo')
  t.equal(todo.json().checked, false)
  t.equal(todo.ast().type, 'listItem')
  todo.checked = true
  t.equal(todo.checked, true)
  t.equal(page.tasks()[0].checked, true)
  t.ok(page.markdown().includes('- [x] Todo'))
  t.ok(todo.html().includes('disabled checked'))
  t.equal(todo.json(false), null)
  t.equal(todo.text(false), '')
  t.equal(todo.html(false), '')
  t.notOk(page.html({ tasks: false }).includes('checkbox'))
  t.ok(page.html({ tasks: false }).includes('Plain'))
  t.throws(() => { todo.checked = 'yes' as any }, /boolean/)
  t.equal(todo.checked, true, 'invalid edits leave the task unchanged')
  t.end()
})

test('tasks preserve nested lists and loose paragraph rendering', (t) => {
  const page = parsePage('- [ ] First\n\n  Second paragraph\n\n  - Nested item\n\n- Ordinary item')
  const html = page.html()
  t.ok(html.includes('<li class="task-list-item"><p><input type="checkbox" disabled> First</p>'))
  t.ok(html.includes('<p>Second paragraph</p>'))
  t.ok(html.includes('Nested item'))
  t.equal((html.match(/type="checkbox"/g) || []).length, 1)
  const task = page.tasks()[0]
  task.remove()
  t.equal(page.tasks().length, 0)
  t.throws(() => { task.checked = true }, /removed|detached/)
  t.end()
})
