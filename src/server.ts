import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { PrismaClient, prismaVersion } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
app.use(express.json())
app.use(cors());

const url = process.env.READSHEET_URL || "";

app.get("/read_db_sheet/:title", async (req, res) => {
    const {title} = req.params
    try{
        const data = await prisma.document.findOne({
            where: {
                title: title
            }
        })
        res.status(200).json({data: data})
    }catch(err){
        res.status(500).json({ 'error': err });
    }finally{
        await prisma.$disconnect();
    }
})

app.post("/create_sheet", async (req, res) => {
  try {
    const body = {
      url:
        "https://docs.google.com/spreadsheets/d/1rLg-79CKagnKhLUWsmiIYUk3xt_BR4au10oFPx0MY18/edit#gid=318641396",
      excluded_sheets: "['Quantitative', 'Verbal']",
    };

    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
    });

    const data = await response.json();    
    
    const {document} = req.body
    await prisma.$queryRaw('DELETE FROM "document";')
    
    await prisma.document.create({
        data: {
            title: document,
            docs: data.data
        }
    })
    
    res.status(200).json({ status: "true" });
  } catch (err) {
      console.log(err);
      
    res.status(500).json({ 'error': err });
  } finally {
    await prisma.$disconnect();
  }
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`server listening on http://localhost:${port}`);
});
