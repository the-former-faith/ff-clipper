import { writable } from 'svelte/store'

export const newspaperRef = writable(undefined)

export const newspaperRefStatus = writable('idle')

export const saveStatus = writable('idle')

export const articleRef = writable(undefined)
