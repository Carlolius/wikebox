export interface AuthResponse {
	user: {
		id: number,
		username: string,
		access_token: string,
		expires_in: number
	}
}
