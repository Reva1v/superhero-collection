import type {Superhero} from "./Superhero.ts";

export interface SuperheroResponse {
    superheroes: Superhero[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
