describe('Live tracking geolocation', () => {
  it('shows off-route toast when simulated positions are off the planned route', () => {
    // Intercept the backend location post and return offRoute true when coordinates are far
    cy.intercept('POST', '/api/user/location', (req) => {
      // For deterministic test: if lat < 0 (arbitrary), respond offRoute true
      const body = req.body
      if (body && body.lat && body.lat < 0) {
        req.reply({ statusCode: 200, body: { ok: true, offRoute: true, distance: 250 } })
      } else {
        req.reply({ statusCode: 200, body: { ok: true, offRoute: false } })
      }
    }).as('postLocation')

    cy.visit('/live-tracking')

    // Stub navigator.geolocation.watchPosition to supply a position sequence (first on-route, then off-route)
    cy.stubGeolocationWatch([
      { lat: 37.7749, lng: -122.4194, delay: 100 },
      { lat: -12.0, lng: 130.0, delay: 200 } // lat < 0 will trigger offRoute via intercept
    ])

    // Start tracking button
    cy.contains('Start Tracking').click()

    // Wait for the intercepted post that indicates offRoute
    cy.wait('@postLocation')

    // The app shows an off-route toast; check for the text
    cy.contains('Off Route', { timeout: 5000 }).should('exist')
  })
})
