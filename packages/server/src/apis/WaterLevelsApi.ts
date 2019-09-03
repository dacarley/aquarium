import { Path, GET } from "typescript-rest";
import DataStore from "@/lib/DataStore";

@Path("waterLevels")
export default class WaterLevelsApi {
    @Path("")
    @GET
    public async get(): Promise<any> {
        return DataStore.get("waterLevels");
    }
}
