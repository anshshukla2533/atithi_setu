declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      stubGeolocationWatch(positions: Array<{lat:number,lng:number,delay?:number}>): void
    }
  }
}

// Stubs navigator.geolocation.watchPosition to call the success callback with the provided positions in sequence
Cypress.Commands.add('stubGeolocationWatch', (positions) => {
  cy.window().then((win) => {
    const original = win.navigator.geolocation
    const stub = {
      watchPosition: (success: any, error: any, opts: any) => {
        let id = 1
        let idx = 0
        function callNext() {
          if (idx >= positions.length) return
          const p = positions[idx]
          const pos = {
            coords: {
              latitude: p.lat,
              longitude: p.lng,
              accuracy: 10
            },
            timestamp: Date.now()
          }
          success(pos)
          idx++
          setTimeout(callNext, p.delay || 500)
        }
        setTimeout(callNext, positions[0]?.delay || 100)
        return id
      },
      clearWatch: (id:number) => { /* no-op for test */ }
    }
    // @ts-ignore
    win.navigator.geolocation = stub
    // keep original available for debugging
    // @ts-ignore
    win.__originalGeolocation = original
  })
})

export {}
