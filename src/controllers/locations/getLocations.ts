import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import StateRepository from '../../repos/state';
import CityRepository from '../../repos/city';

interface ILocation {
  id: string;
  state: string;
  cities: {
    id: string;
    name: string;
  }[];
}

export default async function getLocations (_request: Request, response: Response) {
  const stateRepo = getCustomRepository(StateRepository);
  const cityRepo = getCustomRepository(CityRepository);

  const statesPredefinedResponse = await stateRepo.createQueryBuilder("state")
    .select("state.name", "name")
    .addSelect("state.id", "id")
    .getRawMany() as { name: string, id: string }[];

  let locations = [] as ILocation[];

  for(let state of statesPredefinedResponse) {
    const location: ILocation = {
      id: state.id,
      state: state.name,
      cities: []
    };

    const citiesPredefinedResponse = await cityRepo.createQueryBuilder("city")
      .select("city.name", "name")
      .addSelect("city.id", "id")
      .where("state_id = :id", { id: state.id })
      .getRawMany() as {name: string, id: string}[];
    
    if (citiesPredefinedResponse.length >= 1) {
      for(let city of citiesPredefinedResponse) {
        location.cities.push({
          id: city.id,
          name: city.name
        });
      }
    } 
    locations.push(location);
  }
  return response.status(200).json(locations);
}