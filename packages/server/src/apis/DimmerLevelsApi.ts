import { Path, GET } from "typescript-rest";
import DataStore from "@/lib/DataStore";

@Path("dimmerLevels")
export default class DimmerLevelsApi {
    @Path("")
    @GET
    public async get(): Promise<any> {
        return DataStore.get("dimmerLevels");
    }
}
