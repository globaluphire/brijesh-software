import { PrismaClient } from "@prisma/client";
import { reportItems } from "../../../data/reports";

export default async function handler(req, res) {
    try {
        const qry = new PrismaClient();
        const id = parseInt(req.query.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }
        const itemId = (id + 1).toString();

        const report = reportItems.find((item) => item.reportId === itemId);

        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }
        const result = await qry.$queryRawUnsafe(report.query);

        const resultWithNumbers = result.map((row) => {
            for (const key in row) {
                if (typeof row[key] === "bigint") {
                    row[key] = Number(row[key]);
                }
            }
            return row;
        });

        await qry.$disconnect();

        return res
            .status(200)
            .json({ message: "success", data: resultWithNumbers });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
