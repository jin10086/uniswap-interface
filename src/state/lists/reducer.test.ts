import { createStore, Store } from 'redux'
import { fetchTokenList, acceptListUpdate, addList } from './actions'
import reducer, { ListsState } from './reducer'

const STUB_TOKEN_LIST = {
  name: '',
  timestamp: '',
  version: { major: 1, minor: 1, patch: 1 },
  tokens: []
}

const UPDATED_STUB_LIST = {
  ...STUB_TOKEN_LIST,
  version: { ...STUB_TOKEN_LIST.version, patch: STUB_TOKEN_LIST.version.patch + 1 }
}

describe('list reducer', () => {
  let store: Store<ListsState>

  beforeEach(() => {
    store = createStore(reducer, {
      byUrl: {}
    })
  })

  describe('fetchTokenList', () => {
    describe('pending', () => {
      it('sets pending', () => {
        store.dispatch(fetchTokenList.pending('request-id', 'fake-url'))
        expect(store.getState()).toEqual({
          byUrl: {
            'fake-url': {
              error: null,
              loadingRequestId: 'request-id',
              current: null,
              pendingUpdate: null
            }
          }
        })
      })

      it('does not clear current list', () => {
        store = createStore(reducer, {
          byUrl: {
            'fake-url': {
              error: null,
              current: STUB_TOKEN_LIST,
              pendingUpdate: null,
              loadingRequestId: null
            }
          }
        })

        store.dispatch(fetchTokenList.pending('request-id', 'fake-url'))
        expect(store.getState()).toEqual({
          byUrl: {
            'fake-url': {
              error: null,
              current: STUB_TOKEN_LIST,
              loadingRequestId: 'request-id',
              pendingUpdate: null
            }
          }
        })
      })
    })

    describe('fulfilled', () => {
      it('saves the list', () => {
        store.dispatch(fetchTokenList.fulfilled(STUB_TOKEN_LIST, 'request-id', 'fake-url'))
        expect(store.getState()).toEqual({
          byUrl: {
            'fake-url': {
              error: null,
              current: STUB_TOKEN_LIST,
              loadingRequestId: null,
              pendingUpdate: null
            }
          }
        })
      })

      it('does not save the list in pending if current is same', () => {
        store.dispatch(fetchTokenList.fulfilled(STUB_TOKEN_LIST, 'request-id', 'fake-url'))
        store.dispatch(fetchTokenList.fulfilled(STUB_TOKEN_LIST, 'request-id', 'fake-url'))
        expect(store.getState()).toEqual({
          byUrl: {
            'fake-url': {
              error: null,
              current: STUB_TOKEN_LIST,
              loadingRequestId: null,
              pendingUpdate: null
            }
          }
        })
      })

      it('saves to pending if list is newer', () => {
        store.dispatch(fetchTokenList.fulfilled(STUB_TOKEN_LIST, 'request-id', 'fake-url'))

        store.dispatch(fetchTokenList.fulfilled(UPDATED_STUB_LIST, 'request-id', 'fake-url'))
        expect(store.getState()).toEqual({
          byUrl: {
            'fake-url': {
              error: null,
              current: STUB_TOKEN_LIST,
              loadingRequestId: null,
              pendingUpdate: UPDATED_STUB_LIST
            }
          }
        })
      })
    })

    describe('rejected', () => {
      it('no-op if not loading', () => {
        store.dispatch(fetchTokenList.rejected(new Error('abcd'), 'request-id', 'fake-url'))
        expect(store.getState()).toEqual({
          byUrl: {}
        })
      })

      it('sets the error if loading', () => {
        store = createStore(reducer, {
          byUrl: {
            'fake-url': {
              error: null,
              current: null,
              loadingRequestId: 'request-id',
              pendingUpdate: null
            }
          }
        })
        store.dispatch(fetchTokenList.rejected(new Error('abcd'), 'request-id', 'fake-url'))
        expect(store.getState()).toEqual({
          byUrl: {
            'fake-url': {
              error: 'abcd',
              current: null,
              loadingRequestId: null,
              pendingUpdate: null
            }
          }
        })
      })
    })
  })

  describe('addList', () => {
    it('adds the list key to byUrl', () => {
      store.dispatch(addList('list-id'))
      expect(store.getState()).toEqual({
        byUrl: {
          'list-id': {
            error: null,
            current: null,
            loadingRequestId: null,
            pendingUpdate: null
          }
        }
      })
    })
    it('no op for existing list', () => {
      store = createStore(reducer, {
        byUrl: {
          'fake-url': {
            error: null,
            current: STUB_TOKEN_LIST,
            loadingRequestId: null,
            pendingUpdate: null
          }
        }
      })
      store.dispatch(addList('fake-url'))
      expect(store.getState()).toEqual({
        byUrl: {
          'fake-url': {
            error: null,
            current: STUB_TOKEN_LIST,
            loadingRequestId: null,
            pendingUpdate: null
          }
        }
      })
    })
  })

  describe('acceptListUpdate', () => {
    it('swaps pending update into current', () => {
      store = createStore(reducer, {
        byUrl: {
          'fake-url': {
            error: null,
            current: STUB_TOKEN_LIST,
            loadingRequestId: null,
            pendingUpdate: UPDATED_STUB_LIST
          }
        }
      })
      store.dispatch(acceptListUpdate('fake-url'))
      expect(store.getState()).toEqual({
        byUrl: {
          'fake-url': {
            error: null,
            current: UPDATED_STUB_LIST,
            loadingRequestId: null,
            pendingUpdate: null
          }
        }
      })
    })
  })
})