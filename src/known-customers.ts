export interface KnownCustomer {
  id: string
  name: string
  email: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

export const knownCustomers: KnownCustomer[] = [
  {
    id: 'beavis.and.butthead@highland-high.edu',
    name: 'Beavis and Butthead',
    email: 'beavis.and.butthead@highland-high.edu',
    address: '1321 Wooddale Lane',
    city: 'Highland',
    state: 'Texas',
    zipCode: '79001',
    country: 'United States',
  },
  {
    id: 'homer.simpson@donuts4life.com',
    name: 'Homer Simpson',
    email: 'homer.simpson@donuts4life.com',
    address: '742 Evergreen Terrace',
    city: 'Springfield',
    state: 'Unknown',
    zipCode: '58008',
    country: 'United States',
  },
  {
    id: 'bobby.hill@propane-and-propane-accessories.com',
    name: 'Bobby Hill',
    email: 'bobby.hill@propane-and-propane-accessories.com',
    address: '84 Tom Landry Highway',
    city: 'Arlen',
    state: 'Texas',
    zipCode: '76001',
    country: 'United States',
  },
]
