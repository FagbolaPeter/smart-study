"use client"

/**
 * Thin wrapper around the Google Calendar JS SDK.
 * - No apiKey is included, so nothing sensitive is bundled.
 * - Only the public OAuth client-id is exposed (which is safe).
 */

const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"
const SCOPES = "https://www.googleapis.com/auth/calendar"

let gapi: any
let tokenClient: any

class GoogleCalendarService {
  private static instance: GoogleCalendarService
  private isInitialized = false

  /** Singleton helper */
  public static getInstance() {
    if (!GoogleCalendarService.instance) {
      GoogleCalendarService.instance = new GoogleCalendarService()
    }
    return GoogleCalendarService.instance
  }

  /** Lazy load the Google APIs script and init the Calendar client (no apiKey). */
  public async initialize() {
    if (this.isInitialized) return

    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script")
      script.src = "https://apis.google.com/js/api.js"
      script.onload = () => resolve()
      script.onerror = () => reject(new Error("Failed to load gapi"))
      document.head.appendChild(script)
    })

    // @ts-ignore
    gapi = window.gapi
    await new Promise<void>((resolve, reject) => {
      gapi.load("client", {
        callback: async () => {
          try {
            await gapi.client.init({
              discoveryDocs: [DISCOVERY_DOC],
            })
            resolve()
          } catch (err) {
            reject(err)
          }
        },
        onerror: () => reject(new Error("gapi.client failed to load")),
      })
    })

    // Load Google Identity Services
    await new Promise<void>((resolve, reject) => {
      const gis = document.createElement("script")
      gis.src = "https://accounts.google.com/gsi/client"
      gis.onload = () => resolve()
      gis.onerror = () => reject(new Error("Failed to load GIS"))
      document.head.appendChild(gis)
    })

    // @ts-ignore
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_CLIENT_ID,
      scope: SCOPES,
      callback: () => {},
    })

    this.isInitialized = true
  }

  /** Ask the user for consent and get an access token */
  public async requestAccess() {
    await this.initialize()

    return new Promise<void>((resolve, reject) => {
      tokenClient.callback = (resp: any) => {
        if (resp.error) {
          reject(resp)
        } else {
          resolve()
        }
      }

      if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: "consent" })
      } else {
        tokenClient.requestAccessToken({ prompt: "" })
      }
    })
  }

  /** Quick helper */
  public isSignedIn() {
    return gapi?.client?.getToken() !== null
  }

  /** CRUD helpers below */

  public async createEvent(event: {
    title: string
    start: string
    end: string
    description?: string
  }) {
    this.ensureAuth()
    const res = await gapi.client.calendar.events.insert({
      calendarId: "primary",
      resource: {
        summary: event.title,
        description: event.description,
        start: { dateTime: event.start },
        end: { dateTime: event.end },
      },
    })
    return res.result
  }

  public async getEvents(timeMin?: string, timeMax?: string) {
    this.ensureAuth()
    const res = await gapi.client.calendar.events.list({
      calendarId: "primary",
      timeMin: timeMin || new Date().toISOString(),
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
    })
    return res.result.items ?? []
  }

  public async updateEvent(eventId: string, updates: any) {
    this.ensureAuth()
    const res = await gapi.client.calendar.events.patch({
      calendarId: "primary",
      eventId,
      resource: updates,
    })
    return res.result
  }

  public async deleteEvent(eventId: string) {
    this.ensureAuth()
    await gapi.client.calendar.events.delete({
      calendarId: "primary",
      eventId,
    })
  }

  public signOut() {
    const token = gapi?.client?.getToken()
    if (token) {
      // @ts-ignore
      window.google.accounts.oauth2.revoke(token.access_token)
      gapi.client.setToken("")
    }
  }

  /** Util */
  private ensureAuth() {
    if (!this.isSignedIn()) {
      throw new Error("Google Calendar: not authenticated")
    }
  }
}

/** The single instance used throughout the app */
export const googleCalendar = GoogleCalendarService.getInstance()
