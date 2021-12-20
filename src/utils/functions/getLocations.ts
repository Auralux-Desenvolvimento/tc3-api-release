import { getCustomRepository } from 'typeorm';
import State from '../../models/state';
import Country from '../../models/country';
import City from '../../models/city';
import CityRepository from '../../repos/city';
import StateRepository from '../../repos/state';
import CountryRepository from '../../repos/country';
import fetch from 'node-fetch';
import connect from '../../database';
import { exit } from 'process';
import ILocationData from '../../types/location/ILocationData';

async function getLocations() {
  console.log("Creating locations...");
  await connect();
  const stateRepo = getCustomRepository(StateRepository);
  const countryRepo = getCustomRepository(CountryRepository);
  const cityRepo = getCustomRepository(CityRepository);

  console.log("[1/4] Saving countries...");
  let country: Country = await countryRepo.findOne({ name: "Brasil" }) || new Country() as Country;
  if (!country["name"]) {
    country.name = "Brasil";
    country = await countryRepo.Save(country) as Country;
  }
  
  console.log("[2/4] Fetching states...");
  let statesResponse = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados", {
    method: 'get'
  })

  const statesObject = await statesResponse.json() as {
    id: number;
    nome: string;
    sigla: string;
    regiao: {
      id: number;
      nome: string;
      sigla: string;
    }
  }[];

  let locations = [] as ILocationData[];

  console.log("[3/4] Fetching cities...");
  for (let state of statesObject) {
    let citiesResponse = await fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state.id}/municipios`, 
      {
        method: 'get'
      }
    );

    const cities = await citiesResponse.json() as {
      id: number;
      nome: string;
    }[];
  
    const location: ILocationData = {
      cities: cities.map(e => e.nome),
      state: state.nome
    }

    locations.push(location);
  }

  console.log("[4/4] Saving locations...");
  for (let location of locations) {
    let state = await stateRepo.findOne({ name: location.state });
    if (!state) {
      state = new State();
      state.name = location.state;
      state.country = country;
      state = await stateRepo.Save(state) as State;
    }

    if (state.name === "Distrito Federal") {
      let city = await cityRepo.findOne({ name: "Brasília" });
      if (!city) {
        city = new City();
        city.name = "Brasília";
        city.state = state;
        await cityRepo.Save(city);
      }
    } else {
      for (let cityName of location.cities) {
        let city = await cityRepo.findOne({ name: cityName });
        if (!city) {
          city = new City();
          city.name = cityName;
          city.state = state;
          await cityRepo.Save(city);
        }
      }
    }

  }
  console.log("Locations have been created.")
  exit(0);
}
getLocations();