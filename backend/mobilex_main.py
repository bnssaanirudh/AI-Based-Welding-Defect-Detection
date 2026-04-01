import uvicorn


def run():
    uvicorn.run("backend.mobilex_api:app", host="0.0.0.0", port=8010, reload=True)


if __name__ == "__main__":
    run()
