export async function callApi(method: string, filter: {}, select: string[] | null, entityTypeId: number | null, batchNumber: number, parsed: number): Promise<any[]> {
    let total: number = 0;
    const maxTotal: number = 50;
    let data: any = [];
    console.log(method);
    console.log(entityTypeId);
    console.log(filter);
    console.log(select);
    
    // Проверяем, содержит ли filter массив ID
    const filterHasIdArray = filter && typeof filter === 'object' && 'ID' in filter && Array.isArray((filter as any).ID);
    const idArray = filterHasIdArray ? (filter as any).ID : [];
    
    // Если filter содержит массив ID и их больше 50, обрабатываем через batch
    if (filterHasIdArray && idArray.length > maxTotal) {
        console.log(`Обработка ${idArray.length} ID через batch запросы`);
        let resultData: any[] = [];
        const totalBatches = Math.ceil(idArray.length / maxTotal);
        
        // Создаем batch команды
        let batchCommands: any = {};
        
        for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
            const startIndex = batchIndex * maxTotal;
            const endIndex = Math.min(startIndex + maxTotal, idArray.length);
            const batchIds = idArray.slice(startIndex, endIndex);
            
            // Создаем новый filter с текущей партией ID
            const batchFilter = {
                ...filter,
                ID: batchIds
            };
            
            let batchParams: any = {};
            
            if (method === "task.elapseditem.getlist") {
                batchParams = {
                    ORDER: { 'TASK_ID': 'desc' },
                    FILTER: batchFilter,
                    SELECT: select || [],
                };
            } else {
                batchParams = {
                    filter: batchFilter,
                    select: select || null,
                    entityTypeId: entityTypeId || null,
                    id: method === "crm.dealcategory.stage.list" ? entityTypeId : null,
                    start: 0,
                };
            }
            
            const key = `cmd${batchIndex}`;
            batchCommands[key] = {
                method: method,
                params: batchParams
            };
        }
        
        // Выполняем batch запрос
        await new Promise((resolve) => {
            // @ts-ignore
            BX24.callBatch(batchCommands, (res: any) => {
                for (let i = 0; i < totalBatches; i++) {
                    const key = `cmd${i}`;
                    if (res[key] && !res[key].error()) {
                        const batchData = res[key].data();
                        const processedData = batchData.items ? batchData.items : batchData;
                        resultData.push(processedData);
                    } else if (res[key] && res[key].error()) {
                        console.error(`Ошибка в batch команде ${key}:`, res[key].error());
                    }
                }
                data = resultData;
                resolve(data);
            });
        });
        console.log(data);
        return data.items ? data.items : data;
    }
    
    // Определяем параметры в зависимости от метода
    let params: any = {};

    if (method === "task.elapseditem.getlist" && !Array.isArray(entityTypeId)) {
        // Специфичные параметры для task.elapseditem.getlist
        params = {
            ORDER: { 'TASK_ID': 'desc' },
            FILTER: filter,
            SELECT: select || [],
            start: 0
        };
    } else {
        // Стандартные параметры для других методов
        params = {
            filter: filter ? filter : null,
            select: select ? select : null,
            entityTypeId: entityTypeId ? entityTypeId : null,
            id: method === "crm.dealcategory.stage.list" ? entityTypeId : null,
            start: 0,
        };
    }

    const exceptions: string[] = ["crm.status.list"];
    
    // Обычная обработка для случаев без массива ID или с малым количеством ID
    if(!Array.isArray(entityTypeId)){
        await new Promise((resolve) => {
            // @ts-ignore
            BX24.callMethod(method, params, (res: any) => {
                if (res.data()) {
                    total = res.total();
                    data = res.data();
                    parsed += total;
                    resolve(data);
                }
            });
        });
    }

    if ((total > maxTotal && !exceptions.includes(method)) || Array.isArray(entityTypeId)) {
        let cmd = {};
        let iterations: number = Math.min(Math.ceil((total - batchNumber * 2500) / maxTotal), 50);
        if(iterations === 0){
          iterations = entityTypeId.length;
        }
        let resultData: any[] = [];

        for (let i: number = 0; i < iterations; i++) {
            const key: string = `cmd${i}`;
            
            let batchParams: any = {};
            
            if (method === "task.elapseditem.getlist") {
                batchParams = {
                    ORDER: { 'TASK_ID': 'desc' },
                    FILTER: filter,
                    SELECT: select || [],
                    NAV_PARAMS: {NAV_PARAMS: {
                            "nPageSize": 50,
                            "iNumPage": i + 1,
                        }
                    }
                };
                
                if(entityTypeId && entityTypeId.length > 0){
                    batchParams.TASKID = entityTypeId[i];
                }
            } else {
                batchParams = {
                    filter: filter || null,
                    select: select || null,
                    entityTypeId: entityTypeId || null,
                    id: method === "crm.dealcategory.stage.list" ? entityTypeId : null,
                    start: (batchNumber * 2500) + i * maxTotal,
                };
            }

            const value = {
                method: method,
                params: batchParams,
            };
            
            cmd[key] = value;
            
            if ((i + 1) % maxTotal === 0 || i + 1 === iterations) {
                console.log(cmd);
                const batchLength: number = (i + 1) % maxTotal === 0 ? maxTotal : iterations % maxTotal;
                
                await new Promise((resolve: any) => {
                    // @ts-ignore
                    BX24.callBatch(cmd, (res: any) => {
                        for (let r: number = i - batchLength + 1; r < i + 1; r++) {
                            const key: string = `cmd${r}`;
                            const batchData = res[key].data();
                            const processedData = batchData.items ? batchData.items : batchData;
                            resultData.push(processedData);
                        }
                        if(!Array.isArray(entityTypeId)){
                            resultData = resultData.flat();
                        }
                        
                        data = resultData;
                        cmd = {};
                        resolve();
                    });
                });
                
                break;
            }
        }
    }
    
    return data.items ? data.items : data;
}

// Пример использования нового метода
export async function getTaskElapsedItems(filter: object = {}, select: string[] = [], taskId: any): Promise<any[]> {
    console.log(filter, select, taskId);
    return callApi('task.elapseditem.getlist', filter, select, taskId, 0, 0);
}