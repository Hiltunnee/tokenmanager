import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Stack from "@mui/material/Stack";
import { DataGrid } from '@mui/x-data-grid';
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Card from "@mui/material/Card";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";

export default function Inventory({colors, setColors, tokens, setTokens}) {
    const [updatedTokens, setUpdatedTokens] = useState([...tokens]);
    const [unsavedChanges, setUnsavedChanges] = useState(false);

    const [dialogOpenAdd, setDialogOpenAdd] = useState(false);
    const [newToken, setNewToken] = useState({text: "", base_color: "Black", border_color: "White", amount: "1"});

    const [dialogOpenDelete, setDialogOpenDelete] = useState(false);
    const [tokenToDelete, setTokenToDelete] = useState(null);

    const columns = [
        // { field: 'id', headerName: 'ID', width: 90 },
        { field: 'text', headerName: 'Text', flex: 1, minWidth: 120, editable: true, align: 'center', headerAlign: 'center' },
        { field: 'base_color', headerName: 'Base color', flex: 1, minWidth: 130, editable: true, type: "singleSelect", valueOptions: colors.map(color => color.name), align: 'center', headerAlign: 'center' },
        { field: 'border_color', headerName: 'Border color', flex: 1, minWidth: 130, editable: true, type: "singleSelect", valueOptions: colors.map(color => color.name), align: 'center', headerAlign: 'center' },
        { field: 'amount', headerName: 'Amount', type: 'number', flex: 0.7, minWidth: 100, editable: true, align: 'center', headerAlign: 'center' },
        { field: 'delete', headerName: 'Delete', flex: 0.6, minWidth: 90, editable: false, filterable: false, sortable: false, renderCell: (params) => {
                return (
                <IconButton 
                    onClick={() =>  {
                        setTokenToDelete(params.row);
                        setDialogOpenDelete(true);
                    }}
                    variant="contained"
                >
                    <DeleteIcon />
                </IconButton >
                );
            }, align: 'center', headerAlign: 'center'
        }
    ];

    // const fetchTokens = () => {
    //     fetch("http://localhost:5000/api/tokens")
    //         .then(res => res.json())
    //         .then(data => test(data))
    // };

    // const test = (data) => {
    //     setTokens(data);
    // };

    useEffect(() => {
        setUpdatedTokens([...tokens]);
    }, [tokens]);

    const handleAddToken = (token) => {
        setDialogOpenAdd(false);

        fetch("http://localhost:5000/api/tokens", {
            method: "POST",
            body: JSON.stringify({...token, amount: parseInt(token.amount)}),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(res => res.json())
            .then(data => {
                newToken.id = data.id;
                return newToken;
            })
            .then(newToken => {
                console.log("New token after ID assignment:", newToken);
                setTokens(prev => [...prev, newToken]);
                setUpdatedTokens(prev => [...prev, newToken]);
            });
    };

    const handleDeleteToken = (token) => {
        fetch(`http://localhost:5000/api/tokens/${token.id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(() => {
                setTokens(prev => prev.filter(t => t.id !== token.id));
                setUpdatedTokens(prev => prev.filter(t => t.id !== token.id));
            });

        setDialogOpenDelete(false);
        setTokenToDelete(null);
    };

    const handleSaveChanges = () => {
        const tokensToUpdate = updatedTokens.filter(updated => {
            const original = tokens.find(t => t.id === updated.id);
            return JSON.stringify(original) !== JSON.stringify(updated);
        });

        fetch("http://localhost:5000/api/tokens", {
            method: "PUT",
            body: JSON.stringify(tokensToUpdate),
            headers: {
                "Content-Type": "application/json"
            }
            })
            .then(res => res.json())
            .then(data => setTokens(data));

        setUnsavedChanges(false);
    };

    useEffect(() => {
        setUpdatedTokens([...tokens]);
    }, [tokens]);

    useEffect(() => {
        setUnsavedChanges(JSON.stringify(tokens) !== JSON.stringify(updatedTokens));
    }, [tokens, updatedTokens]);

    return (
        <Box>
            <Box sx={{ height: 'calc(100vh - 200px)', width: '100%', display: 'flex', flexDirection: 'column' }}>
                <DataGrid
                    key={JSON.stringify(columns)}
                    rows={updatedTokens}
                    columns={columns}
                    initialState={{
                    pagination: {
                        paginationModel: {
                        pageSize: 50,
                        },
                    },
                    }}
                    pageSizeOptions={[10, 20, 50, 100, 200]}
                    // checkboxSelection
                    disableRowSelectionOnClick
                    processRowUpdate={(newRow, oldRow) => {
                        const updatedRows = updatedTokens.map((row) =>
                            row.id === newRow.id ? newRow : row
                        );
                        setUpdatedTokens(updatedRows);
                        return newRow;
                    }}
                    onProcessRowUpdateError={(error) => 
                        console.error("Error updating row:", error)
                    }
                    sx={{
                        '& .MuiDataGrid-cell': {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        },
                        '& .MuiDataGrid-columnHeader': {
                            backgroundColor: '#f5f5f5',
                            fontWeight: 600,
                        },
                        '& .MuiDataGrid-columnHeaderTitle': {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                        }
                    }}
                />
            </Box>
            <Dialog open={dialogOpenAdd} onClose={() => setDialogOpenAdd(false)}>
                <DialogTitle>Add token</DialogTitle>
                <Stack spacing={2} justifyContent="center" sx={{ padding: 2 }}>
                    <FormControl>
                        <TextField label="Text" fullWidth margin="normal" value={newToken.text} onChange={(e) => setNewToken(prev => ({...prev, text: e.target.value.toUpperCase()}))}/>
                    </FormControl>

                    <Stack direction="row" spacing={2} justifyContent="center">
                        <FormControl>
                            <Select fullWidth label="Base color" value={newToken.base_color} onChange={(e) => setNewToken(prev => ({...prev, base_color: e.target.value}))}>
                                {colors.map(color => (
                                    <MenuItem key={color.id} value={color.name}>{color.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl>
                            <Select fullWidth label="Border color" value={newToken.border_color} onChange={(e) => setNewToken(prev => ({...prev, border_color: e.target.value}))}>
                                {colors.map(color => (
                                    <MenuItem key={color.id} value={color.name}>{color.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>

                    <FormControl>
                        <TextField
                            label="Amount"
                            type="number"
                            fullWidth
                            margin="normal"
                            value={newToken.amount}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === "" || (parseInt(value) >= 1 && !isNaN(parseInt(value)))) {
                                    setNewToken(prev => ({...prev, amount: value}));
                                }
                            }}
                            inputProps={{ min: 1 }}
                        />
                    </FormControl>

                    <Button variant="contained" onClick={() => handleAddToken(newToken)}> Add </Button>
                </Stack>
            </Dialog>
            <Dialog open={dialogOpenDelete} onClose={() => setDialogOpenDelete(false)}>
                <DialogTitle>Delete token</DialogTitle>
                <p>Are you sure you want to delete this token?</p>
                <Stack direction="row" spacing={2} justifyContent="center">
                    <Button variant="outlined" onClick={() => setDialogOpenDelete(false)}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="error" onClick={() => {handleDeleteToken(tokenToDelete)}}>
                        Delete
                    </Button>
                </Stack>
            </Dialog>
            {unsavedChanges && (
                <Card>
                    <p>You have unsaved changes!</p>
                </Card>
            )}
            <Stack direction="row" spacing={2} justifyContent="center" sx={{marginTop: 2}}>
                <Button variant="contained" onClick={() => { setNewToken({text: "", base_color: "Black", border_color: "White", amount: "1"}); setDialogOpenAdd(true); }}>
                    Add Token
                </Button>
                <Button variant="contained" color="success" disabled={!unsavedChanges} onClick={() => {handleSaveChanges(); setUnsavedChanges(false);}}>
                    Save changes
                </Button>
            </Stack>
        </Box>
    );
};
