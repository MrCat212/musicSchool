import { Select } from "antd";
import { useEffect, useState } from "react";
import Repertoire from "../../../components/Repertoire/Repertoire";

export const UsersRepertoire = ({allUsers}) => {

    const [selectedUser, setSelectedUser] = useState();

    useEffect(() => {
        let clone = {}; 

        for (let key in selectedUser) {
            clone[key] = selectedUser[key];
        }

        setSelectedUser(clone ?? allUsers[0]);

    }, [allUsers])

    const handleChange = (select) => {
        setSelectedUser(allUsers.find(user => user._id === select))
    }

    return(
        <>
            {allUsers.length && (
                <>
                    <Select defaultValue={selectedUser?._id ?? allUsers[0]._id} onChange={handleChange}>
                        {allUsers?.map((user, index) => (
                            <Select.Option 
                                key={index} 
                                value={user._id}
                            >
                                {
                                    user?.fullName ?? 
                                    user?.firstName + ' ' 
                                    + user?.lastName + ' ' 
                                    + user?.surname ?? ''
                                }
                            </Select.Option>
                        ))}
                    </Select>
                    <Repertoire userContextProp={allUsers.find(user => user?._id === selectedUser?._id) ?? allUsers[0]}/>
                </>
            )}
        </>
    )
}