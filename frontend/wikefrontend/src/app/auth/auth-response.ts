/* Probablemente sobre el archivo este */
export interface AuthResponse {
	user: {
		id: number,
		username: string,
		access_token: string,
		refresh_token: string
	}
}
