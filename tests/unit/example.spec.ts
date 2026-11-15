import { mount } from '@vue/test-utils'
import HomePage from '@/views/HomePage.vue'
import { nextTick } from 'vue'
import { describe, expect, test, vi } from 'vitest'

describe('HomePage.vue', () => {
  test('renders home vue', () => {
    const wrapper = mount(HomePage)
    expect(wrapper.text()).toMatch('Find a place')
    expect(wrapper.text()).toMatch('Spaces worth')
  })

  test('opens the tutorial when How it works is clicked', async () => {
    const showModal = vi.fn()
    const originalShowModal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal')
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: showModal })

    const wrapper = mount(HomePage)
    try {
      await wrapper.get('.how-it-works-button').trigger('click')
      await nextTick()

      expect(showModal).toHaveBeenCalledOnce()
      expect(wrapper.find('.tutorial-dialog').exists()).toBe(true)
      expect(wrapper.text()).toContain('Explore spaces')
    } finally {
      wrapper.unmount()
      if (originalShowModal) {
        Object.defineProperty(HTMLDialogElement.prototype, 'showModal', originalShowModal)
      } else {
        Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal')
      }
    }
  })
})
