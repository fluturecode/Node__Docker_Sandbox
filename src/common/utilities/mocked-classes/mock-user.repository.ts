export const mockUserRepository = jest.fn(() => ({
  comparePassword: jest.fn(),
  createSession: jest.fn(),
  createUser: jest.fn(),
  findUserByJwtPayload: jest.fn(),
  findUserById: jest.fn(),
  setPassword: jest.fn()
}));