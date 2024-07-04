import { Binary } from '../../fbs/data-producer/binary';
import { String } from '../../fbs/data-producer/string';
export declare enum Data {
    NONE = 0,
    String = 1,
    Binary = 2
}
export declare function unionToData(type: Data, accessor: (obj: Binary | String) => Binary | String | null): Binary | String | null;
export declare function unionListToData(type: Data, accessor: (index: number, obj: Binary | String) => Binary | String | null, index: number): Binary | String | null;
//# sourceMappingURL=data.d.ts.map