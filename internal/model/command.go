package model

/*
Command represents an instruction received from the Frontend,
containing an action name and optional parameters.
*/
type Command struct {
	Action string      `json:"action"`
	Params interface{} `json:"params,omitempty"`
}